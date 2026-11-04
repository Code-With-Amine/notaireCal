import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const BASE = process.env.AUDIT_BASE || "http://localhost:3000";
const OUT = "C:\\Users\\Administrator\\AppData\\Local\\Temp\\opencode\\daribati-audit";

const routes = (process.env.AUDIT_ROUTES || [
  "/",
  "/declarations",
  "/tnb",
  "/tva",
  "/cnp",
  "/taxi",
  "/drinks",
  "/sejour",
  "/forecast",
  "/settings",
  "/notaire/login",
  "/notaire/register",
  "/admin",
].join(",")).split(",");

const viewports = (process.env.AUDIT_VIEWPORTS || "320,375,414,768,1024,1280,1440")
  .split(",")
  .map(Number);

const shots = (process.env.AUDIT_SHOTS || "375,1280")
  .split(",")
  .map(Number);

if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=" + OUT + "\\profile",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--hide-scrollbars",
  "--disable-extensions",
  "--mute-audio",
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getVersion() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return await res.json();
    } catch {}
    await sleep(150);
  }
  throw new Error("Chrome did not start");
}

const version = await getVersion();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let seq = 0;
const pending = new Map();
const eventWaiters = new Map();
const allEvents = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (msg.method) {
    allEvents.push(msg);
    const key = msg.method + (msg.sessionId ? ":" + msg.sessionId : "");
    const waiters = eventWaiters.get(key);
    if (waiters?.length) {
      const w = waiters.shift();
      w(msg.params);
    }
  }
};

function send(method, params = {}, sessionId) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, 30000);
  });
}

function waitEvent(method, sessionId, timeout = 20000) {
  const key = method + (sessionId ? ":" + sessionId : "");
  return new Promise((resolve, reject) => {
    const arr = eventWaiters.get(key) || [];
    const timer = setTimeout(() => {
      eventWaiters.set(
        key,
        (eventWaiters.get(key) || []).filter((fn) => fn !== wrapped),
      );
      reject(new Error(`Event timeout: ${method}`));
    }, timeout);
    const wrapped = (params) => {
      clearTimeout(timer);
      resolve(params);
    };
    arr.push(wrapped);
    eventWaiters.set(key, arr);
  });
}

async function newPage() {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  return { targetId, sessionId };
}

async function evalJS(sessionId, expression) {
  const res = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.text || "evaluate failed");
  }
  return res.result.value;
}

async function setViewport(sessionId, width, height) {
  await send(
    "Emulation.setDeviceMetricsOverride",
    {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
      screenWidth: width,
      screenHeight: height,
    },
    sessionId,
  );
}

async function auditPage({ sessionId }, url, width) {
  await setViewport(sessionId, width, 900);
  await send("Page.navigate", { url }, sessionId);
  await waitEvent("Page.loadEventFired", sessionId).catch(() => {});
  await evalJS(
    sessionId,
    "new Promise(r => setTimeout(r, 900))",
  );

  return await evalJS(
    sessionId,
    `(() => {
      const vw = window.innerWidth;
      const doc = document.documentElement;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.right > vw + 1 || r.left < -1) {
          const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 70);
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls: typeof el.className === 'string' ? el.className.slice(0, 110) : '',
            left: Math.round(r.left),
            right: Math.round(r.right),
            w: Math.round(r.width),
            text,
          });
        }
        if (bad.length >= 12) break;
      }
      return {
        url: location.pathname,
        vw,
        scrollWidth: doc.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        overflowX: doc.scrollWidth > vw + 1,
        overflow: bad,
        title: document.title,
      };
    })()`,
  );
}

async function screenshot(sessionId, path) {
  // Full-page captures duplicate/lay over fixed bottom navigation; hide it so
  // the document itself can be reviewed without capture artifacts.
  await evalJS(
    sessionId,
    "(() => { const n = document.querySelector('.mobile-nav'); if (n) n.style.display = 'none'; document.body.style.paddingBottom = '0px'; window.scrollTo(0, 0); return true; })()",
  );
  const metrics = await send("Page.getLayoutMetrics", {}, sessionId);
  const size = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(size.width);
  const height = Math.min(Math.ceil(size.height), 6000);
  const { data } = await send(
    "Page.captureScreenshot",
    {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    },
    sessionId,
  );
  await writeFile(path, Buffer.from(data, "base64"));
}

// Authenticate admin/notaire once so protected dashboards are auditable.
async function loginCookies(endpoint, email, password) {
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return [];
    const raw = res.headers.getSetCookie?.() || [];
    return raw.map((c) => c.split(";")[0]);
  } catch {
    return [];
  }
}

const page = await newPage();
const cookies = [
  ...(await loginCookies(
    "/api/admin/login",
    process.env.ADMIN_EMAIL || "amineabaidi546@gmail.com",
    process.env.ADMIN_PASSWORD || "AdminPass123!",
  )),
  ...(await loginCookies(
    "/api/notaire/login",
    process.env.NOTAIRE_EMAIL || "audit.notaire@daribati.local",
    process.env.NOTAIRE_PASSWORD || "AuditPass123!",
  )),
];
if (cookies.length) {
  await send(
    "Network.setCookies",
    {
      cookies: cookies.map((pair) => {
        const [name, value] = pair.split("=");
        return {
          name,
          value,
          domain: "localhost",
          path: "/",
          httpOnly: true,
        };
      }),
    },
    page.sessionId,
  );
}

const report = [];
for (const route of routes) {
  for (const width of viewports) {
    const url = BASE + route;
    try {
      const result = await auditPage(page, url, width);
      report.push({ route, width, ...result });
      console.log(
        `${route} @ ${width} -> ${result.overflowX ? "OVERFLOW " + result.scrollWidth : "ok"}`,
      );
    } catch (e) {
      report.push({ route, width, error: String(e) });
      console.log(`${route} @ ${width} -> ERROR ${e}`);
    }
  }
  if (shots.some((w) => viewports.includes(w))) {
    for (const width of shots) {
      try {
        await setViewport(page.sessionId, width, 900);
        await send("Page.navigate", { url: BASE + route }, page.sessionId);
        await waitEvent("Page.loadEventFired", page.sessionId).catch(() => {});
        await evalJS(page.sessionId, "new Promise(r => setTimeout(r, 900))");
        const name =
          (route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-")) +
          `-${width}.png`;
        await screenshot(page.sessionId, `${OUT}\\${name}`);
      } catch (e) {
        console.log(`shot ${route} @ ${width} failed: ${e}`);
      }
    }
  }
}

await writeFile(`${OUT}\\report.json`, JSON.stringify(report, null, 2));
console.log(`\nReport: ${OUT}\\report.json`);
console.log(`Screenshots: ${OUT}`);

ws.close();
chrome.kill();
process.exit(0);
