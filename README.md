# LifeClues — Frontend (Step 1: Landing + Account UI)

The private, calm, book-like memory journal. This is the **frontend** for
Step 1: the pages you click on top of the backend account system.

## What you can do today

- Browse the **landing page** (`/`)
- **Create an account** (`/register`)
- **Sign in** with your email **or** username (`/login`)
- Land in your **journal** space (`/app`) — writing itself arrives in the next step
- View & edit your **profile** (`/app/profile`) — display name and bio, plus
  optional details you can add or leave blank whenever you like: birthday,
  phone, gender, city, country, profession, relationship status, languages.
  These details feed future features (birthday memories, places & people).
- **Change your password** (`/app/profile/security`)
- **Sign out**
- Switch between **3 themes** (Paper & Book, Modern Minimal, Earthy Calm)
  and **light / dark / auto** mode — from the palette icon in the top bar.
  Your choice is remembered on this device.

## Run it

First, make sure the backend is running (it proxies `/api` requests):

```bash
cd lifeclues
./dev.sh                    # backend on http://localhost:8080
```

In another terminal, start the frontend:

```bash
cd lifeclues-web
npm install
npm run dev
```

Open **http://localhost:5173** and sign up.

The Vite dev server automatically forwards any `/api/...` request to the
backend (`vite.config.js`), so the browser never talks to two servers.
Your login is kept safe as an **access token** (short-lived) plus a
**refresh token** (long-lived). When the access token expires, the frontend
silently refreshes it for you — you won't notice.

## Useful commands

```bash
npm run dev      # start the dev server (hot reload)
npm run build    # production build into dist/
npm run lint     # oxlint checks
npm run preview  # preview the production build
```

## How the code is organized

```
src/
├── main.jsx / App.jsx   entry point + routes
├── index.css            Tailwind v4 + theme tokens (see below)
├── themes.css           all 3 themes x light/dark colours
├── theme/               ThemeContext + AppearanceMenu (theme picker)
├── auth/                AuthContext (login/register/logout/me)
├── api/                 fetch wrapper (automatic refresh) + endpoint calls
├── ui/                  logo, buttons, fields, alerts, app shell, guards
└── pages/               Landing, Login, Register, Journal, Profile, Security, 404
```

## The theme system

Tailwind utilities like `bg-paper`, `text-ink`, `border-line`,
`bg-accent` are mapped to CSS variables. Each theme + mode sets those
variables on the `<html>` element (`data-theme`, `data-mode`), so the whole
app recolors instantly. The choice is stored in `localStorage`
(`lifeclues.theme`, `lifeclues.mode`). Defaults: **Paper & Book**, mode = follow
the system.

## Security notes

- Passwords never touch the frontend storage — only tokens do.
- No secret is baked into frontend code; the backend alone knows your password.