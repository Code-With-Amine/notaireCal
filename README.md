# notaireCal

Calculateur de taxes locales **Daribati** — application web Next.js pour estimer les taxes municipales marocaines : terrains non bâtis (TNB), taxe sur les activités professionnelles, débits de boissons, séjours, et prévisions de paiement.

## Fonctionnalités

- **TNB (Terrains Non Bâtis)** : calcul année par année, tarifs historiques et par zone, DEF, majorations, mois de retard, statut de déclaration par année.
- **Rapport PDF** : export complet depuis le résultat affiché (tableau, explication de chaque élément, détail du calcul par année, limites et règles à vérifier).
- **Sections « Comprendre le calcul »** intégrées à l'interface, sans recalcul des montants.
- **Français / arabe** avec mise en page RTL, thèmes clair et sombre, interface responsive.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- jsPDF + jspdf-autotable pour les rapports
- Vitest pour les tests

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm test` | Tests (Vitest) |

## Structure

- `app/` — pages et routes (App Router)
- `components/` — interface et calculateurs
- `lib/` — moteur de calcul, règles de taux, i18n, génération PDF, tests
- `public/` — images et icônes

## Avertissement

Les montants produits sont des **simulations** basées sur les paramètres et règles configurés dans l'application. Ils doivent être confirmés auprès du service compétent avant tout usage officiel.
