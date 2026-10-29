import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Daribati — Calculateur de taxes locales",
    template: "%s | Daribati",
  },
  description:
    "Calculez vos taxes locales au Maroc, consultez les taux historiques et anticipez vos paiements mensuels.",
  applicationName: "Daribati",
  keywords: [
    "Daribati",
    "taxes locales",
    "TNB",
    "taxe de séjour",
    "taxe sur les boissons",
    "taxe de transport",
    "Maroc",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
};

const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem('daribati.theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    var language = localStorage.getItem('daribati.language');
    if (language === 'ar') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
