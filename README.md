# LifeClues

**Small Clues. Big Memories.**

LifeClues is a private memory journal — a calm, book-like space where you write down the moments that matter and later rediscover them through small clues. I built this because I wanted a journal that actually feels good to use, not just another note-taking app.

This repository is the **frontend** — a React single-page application that talks to a Spring Boot backend over a REST API.

---

## What it does

I designed this to be a place where you write freely about your days, tag each memory with small clues (like "Mom", "Bangalore", "first trip"), and then later stumble back onto those moments through search or browsing. It's meant to feel personal and quiet, not cluttered with dashboards or stats.

Here's what you can do with it right now:

- **Write memories and drafts** — title, content, date, time, and tags. Drafts auto-save without enforcing structure; completed memories require at least one tag.
- **Tag your memories** — add clues like people, places, feelings, or anything that helps you find the moment later.
- **Browse your journal** — a tab-based view with Home (today + recent), Memories (all completed), and Search (full-text with tag and date filters).
- **Read mode** — distraction-free reading view with auto-hiding controls. Tags are accessible from here too.
- **Soft-delete with trash** — deleted memories go to Trash for 30 days before permanent removal. You can restore or permanently delete from there.
- **Profile management** — update your display name, bio, and optional details like birthday, city, profession, and more.
- **Time format preference** — choose between 12-hour (AM/PM) and 24-hour time display.
- **3 themes, 3 modes** — Paper & Book, Modern Minimal, and Earthy Calm. Each in light, dark, or system-follow. Your choice sticks.
- **Password management** — change your password, forgot password flow, email verification on signup.
- **Permanent account deletion** — delete your account and all data from the Security page. Single confirmation, done.

---

## Tech stack

I kept the tooling simple and modern. No heavy frameworks, just the essentials:

- **React 19** — latest React with concurrent features
- **React Router 7** — client-side routing with nested layouts
- **Tailwind CSS 4** — utility-first styling via the Vite plugin
- **Vite 8** — fast dev server and production bundler
- **Lucide React** — clean, consistent icons
- **oxlint** — fast Rust-based linter

No TypeScript, no Redux, no state management libraries — just React state and context. I wanted to keep the codebase approachable.

---

## Project structure

```
lifeclues-web/
├── public/
│   └── favicon.svg              # branded book-icon favicon
├── src/
│   ├── main.jsx                 # React DOM entry
│   ├── App.jsx                  # routes + providers
│   ├── index.css                # Tailwind v4 imports + theme tokens
│   ├── themes.css               # 3 themes × light/dark custom properties
│   ├── api/
│   │   ├── http.js              # fetch wrapper with automatic token refresh
│   │   └── client.js            # typed endpoint functions (auth, account, memories, tags)
│   ├── auth/
│   │   └── AuthContext.jsx      # login, register, logout, session restore
│   ├── theme/
│   │   ├── ThemeContext.jsx      # theme + mode state, localStorage persistence
│   │   └── AppearanceMenu.jsx   # floating theme picker (palette icon)
│   ├── ui/
│   │   ├── AppShell.jsx         # authenticated layout (logo + nav + content)
│   │   ├── AuthLayout.jsx       # unauthenticated layout (login/register)
│   │   ├── Logo.jsx             # branded logo component
│   │   ├── Button.jsx           # reusable button with variants
│   │   ├── Field.jsx            # form field wrappers
│   │   ├── Alert.jsx            # success/error alert banners
│   │   ├── Spinner.jsx          # loading indicator
│   │   └── RouteGuards.jsx      # protected + guest-only route wrappers
│   └── pages/
│       ├── Landing.jsx          # public homepage
│       ├── Login.jsx            # email/username login
│       ├── Register.jsx         # account creation
│       ├── CheckEmail.jsx       # post-registration email prompt
│       ├── VerifyEmail.jsx      # email verification handler
│       ├── ForgotPassword.jsx   # password reset request
│       ├── ResetPassword.jsx    # password reset form
│       ├── Journal.jsx          # main app — memory CRUD, search, trash, tags
│       ├── ProfileShell.jsx     # profile tab navigation
│       ├── Profile.jsx          # about/edit profile
│       ├── AppearanceTab.jsx    # theme, mode, time format settings
│       ├── Security.jsx         # password change + account deletion
│       ├── Privacy.jsx          # privacy policy
│       ├── Terms.jsx            # terms of service
│       ├── Contact.jsx          # contact page
│       └── NotFound.jsx         # 404 page
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting started

### Prerequisites

- Node.js 18+ (I use 22)
- The [LifeClues backend](https://github.com/helloabdulmajid/lifeclues) running on `localhost:8080`

### Installation

```bash
git clone https://github.com/helloabdulmajid/lifeclues-web.git
cd lifeclues-web
npm install
```

### Environment variables

This frontend doesn't use any `.env` files. The API base URL is configured in `vite.config.js` as a proxy:

```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
  },
}
```

In production, you'd serve the built files through a reverse proxy (like Nginx) that routes `/api` requests to your backend.

### Development

```bash
npm run dev
```

Opens at **http://localhost:5173**. The dev server proxies all `/api` requests to the backend, so you get a seamless experience — no CORS issues, no extra config.

### Production build

```bash
npm run build
```

Outputs optimized static files to `dist/`. Serve them however you like — Nginx, Vercel, Netlify, or any static host. Just make sure `/api` routes reach the backend.

### Other commands

```bash
npm run lint      # run oxlint
npm run preview   # preview the production build locally
```

---

## Backend / API

This frontend expects a REST API at `/api` with these groups of endpoints:

- **Auth** — register, login, logout, email verification, password reset
- **Account** — profile CRUD, password change, account deletion
- **Memories** — full CRUD with soft-delete, trash, restore, permanent delete
- **Tags** — list user tags

The backend handles authentication via JWT (short-lived access token + long-lived refresh token). The frontend automatically refreshes expired tokens in the background — you won't notice it happening.

The backend also owns the database migrations (Flyway), so there's nothing to set up on the frontend side beyond having the backend running.

---

## Responsive design & themes

I made sure this works well from phones to desktops:

- **Mobile-first layout** — bottom navigation bar for primary actions, content fills the screen
- **Tablet/desktop** — centered max-width containers, comfortable reading widths
- **Touch-friendly** — large tap targets, native date/time pickers on mobile
- **Safe area support** — respects iPhone notch/inset areas

The theme system uses CSS custom properties on `<html>`. Each theme defines tokens like `--ink`, `--paper`, `--accent`, `--line`, and Tailwind utilities like `bg-surface`, `text-ink`, `border-line` map to those variables. Switching themes or modes recolors the entire app instantly.

Your theme and mode preference saves to `localStorage` and restores on return.

---

## License

Not specified yet.

---

Built with care by [Abdul Majid](https://github.com/helloabdulmajid).
