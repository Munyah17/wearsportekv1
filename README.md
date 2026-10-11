# WearSportek

A sportswear e-commerce app (React Native / Expo) that ships as **web + PWA now** and **iOS / Android later** — one codebase throughout.

## Stack

- **Expo + expo-router** — one codebase for web (PWA) & native
- **NativeWind** — Tailwind utilities inside React Native
- **lucide-react-native** — icons
- **Supabase** — Postgres database, auth (admin/user roles), image storage
- **Paynow Zimbabwe** — payments (EcoCash, InnBucks, Omari, OneMoney, transfers, cards)
- **Zustand** — cart & site-settings state

## Quick start

```bash
npm install
npx expo start --web     # http://localhost:8081 — works offline with seed data
```

The app runs **fully without a backend** using the seed data in `lib/seed.ts`. Connect Supabase to make it live.

## Payments (Paynow)

Checkout calls the small Express server in `server/` — it owns the Paynow integration key (never shipped to the client).

```bash
cp .env.example .env        # fill in Paynow + Supabase keys
npm run server              # http://localhost:4242
```

Endpoints:

- `POST /api/pay/init` — `{ orderId, reference, amount, method, customerPhone, customerEmail, items }` → returns `{ kind: 'redirect', redirectUrl }` for hosted checkout or `{ kind: 'mobile', instructions, pollUrl }` for EcoCash/InnBucks/Omari/OneMoney prompts.
- `GET /api/pay/status?pollUrl=…` — poll payment status.
- `POST /api/pay/result` — Paynow result webhook; verifies hash, marks order `paid`.

Customers only ever see **EcoCash / InnBucks / Omari / Cash-Transfer / Card** labels — Paynow stays invisible.

## Supabase setup

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor (tables, triggers, RLS, admin bootstrap).
3. Create a public storage bucket named `images`.
4. Create your admin user in Authentication → Users, then in Table editor set `profiles.role = 'admin'`.
5. Copy `.env.example` → `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Admin portal

`/admin` (admin role only) manages **everything**:

- Products (name, images/upload, price, sale price, sizes, stock, badge, featured, customisable)
- Categories & homepage order (first 5 render as homepage sections)
- Orders (items, customisation details, status pipeline)
- Hero banners (up to 10 slides)
- Delivery zones & fees
- Payment methods (labels, hints, order, visibility)
- Site settings (name, tagline, announcement, contact, address, footer, socials, about page, **customisation fees**, currency)

## Structure

```
app/            routes (home, shop, category, product, cart, checkout, account, admin/*)
components/     NavBar, Footer, HeroCarousel, ProductCard, CategorySection, ui, admin
lib/            types, theme, seed, supabase, data, store, payments, admin, hooks
server/         Paynow payment server (Express)
supabase/       schema.sql
public/         PWA manifest, service worker, index.html
```

## Native builds later

The same codebase exports to iOS/Android via EAS Build:

```bash
eas build --platform android   # then ios
```

`lucide-react-native`, AsyncStorage persistence, and the Supabase auth flow are already native-ready.
