# VOLTARIS — Electronics Gadgets Management & Analytics Studio

> **"Every gadget. Every number. Under control."**

VOLTARIS is a production-grade, multi-page SaaS website with a working operational dashboard built for electronics retailers, repair studios, and gadget distributors. Designed with the **"Circuit-Noir Neon"** aesthetic, it features an air-gapped **Zero-CDN architecture**, authentic 3D tilt cards on all card types, strictly center-aligned card layouts, rotating electronics-themed animations, and a responsive single-page operational application with role-based access control (RBAC).

---

## ⚡ Key Highlights & Architecture

- **Strict Navigation Bar:** Only 4 primary links (`Home`, `Platform`, `Insights`, `Contact`) + Theme Toggle, "Sign In" button, and "Start Free" CTA.
- **Deep Content Structure:** Every page features **10 to 11 rich, long sections** with comprehensive technical copy.
- **Theme: Circuit-Noir Neon:** Built with CSS Custom Properties (`--bg-void: #050816`, `--volt: #C6FF3D`, `--signal: #22E5FF`, `--plasma: #8B5CFF`, `--flare: #FF3D8B`, `--amber: #FFB020`). Includes a Light/Dark theme switcher with persistence.
- **Mandatory 3D Tilt Cards (`data-tilt`):** Applied to every card type across the platform. Features ±12° 3D perspective rotation, `preserve-3d`, specular glare following the cursor, and touch/reduced-motion fallbacks.
- **Strict Center-Alignment:** In **ALL screen views** (mobile, tablet, laptop, desktop), card icons and text are center-aligned with glowing badges.
- **Rotating Electronics Animations:**
  1. Circuit-trace line drawing border on hover (`.anim-circuit-border`)
  2. Pulsing signal radar ring behind the icon badge (`.anim-signal-ring`)
  3. Dynamic battery charge fill bar (`.anim-battery-bar`)
  4. Sweeping laser scanning beam (`.anim-laser-scan`)
  5. Multi-state blinking LED dot (`.anim-blinking-led`)
  6. Equalizer waveform frequency bounce (`.anim-equalizer-bars`)
- **Zero-CDN Guarantee:** 100% of fonts (*Space Grotesk*, *Inter*, *JetBrains Mono*), scripts (*Chart.js UMD*), and 42 topic-related high-resolution images are stored locally in `/assets/` and `/images/`. Zero external URL dependencies.
- **Full Operational Dashboard SPA (`dashboard.html`):**
  - **Overview View:** KPI cards, live revenue trajectory line chart, category donut, critical low-stock triggers, and an animated hardware health gauge.
  - **Inventory View:** Sortable, searchable, and paginated table with 65 seeded realistic gadget records from `assets/data/products.json`, complete with Add/Edit/Delete modal forms and stock status chips.
  - **Analytics View:** Multi-period comparative modeling and turnover velocities.
  - **Reports View:** Compliance templates with working **Export to CSV**, **Excel (.csv with BOM)**, and **Print to PDF** (`@media print` stylesheet).
  - **Users & RBAC View:** User directory and real-time permission toggle matrix. Toggling permissions immediately enables or disables capabilities in the UI.
  - **Settings View:** API key masked display with reveal toggle and notification controls.

---

## 🚀 Running Locally

Because VOLTARIS uses vanilla ES modules (`type="module"`), it should be served via any local HTTP static server:

### Option 1: Python (Built-in)
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000/index.html`.

### Option 2: Node.js (npx serve or live-server)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🔐 Demo Credentials (One-Click Quick Login)

Four role-based accounts are pre-seeded in `localStorage` and available via one-click buttons on `login.html`:

| Role | Email | Password | Permissions & Scope |
|---|---|---|---|
| **Admin** | `admin@voltaris.demo` | `Admin@123` | Full access: Add/Edit/Delete inventory, modify RBAC matrix, export all reports, view API keys. |
| **Manager** | `manager@voltaris.demo` | `Manager@123` | Inventory CRUD + reports export + view user directory. Cannot edit master RBAC matrix. |
| **Analyst** | `analyst@voltaris.demo` | `Analyst@123` | Read-only analytics & reporting with export permissions. Cannot edit inventory or users. |
| **Viewer** | `viewer@voltaris.demo` | `Viewer@123` | Read-only Overview access only. Inventory, Analytics, Reports, and User modifications are restricted. |

---

## 🎨 How to Customize Brand & Colors

All branding tokens are centralized in `assets/css/tokens.css`. To re-skin the application for a client, simply adjust the CSS variables:

```css
:root {
  /* Brand Accents */
  --volt: #C6FF3D;          /* Primary CTA / Highlight (Electric Lime) */
  --signal: #22E5FF;        /* Secondary Data Signal (Cyan) */
  --plasma: #8B5CFF;        /* High-tech Gradient (Deep Violet) */
  --flare: #FF3D8B;         /* Negative deltas & critical alerts */
  --amber: #FFB020;         /* Warnings & low-stock alerts */

  /* Dark Theme Surfaces */
  --bg-void: #050816;       /* Deepest background void */
  --bg-board: #0B1030;      /* Section backing & panel */
  --bg-card: rgba(18, 26, 66, 0.55); /* Glass cards with backdrop-blur */
}
```

Typography can be updated in `assets/css/tokens.css` and `assets/css/base.css` by modifying the `@font-face` bindings.

---

## 📁 Project Directory Layout

```
/
├── index.html                     # Home page (11 rich sections, 3D mock, category tabs)
├── platform.html                  # Platform deep-dive (11 sections, RBAC, comparison table)
├── insights.html                  # Analytics studio (10 sections, interactive charts, leaderboard)
├── contact.html                   # Contact & About (11 sections, interactive form, SVG map, team)
├── login.html                     # Split-screen authentication with 1-click role fill
├── signup.html                    # Split-screen account provisioning
├── dashboard.html                 # 6-view Single-Page App with inventory CRUD & reports
├── privacy.html                   # Legal compliance policy
├── terms.html                     # Terms of service
├── 404.html                       # Animated 404 error page
├── sitemap.xml                    # SEO sitemap
├── robots.txt                     # Crawler rules (noindex on dashboard/auth)
├── README.md                      # This technical documentation
├── images/
│   ├── brand/                     # SVG logo, logo-mark, favicon
│   ├── hero/                      # 16:9 Hero visual
│   ├── products/                  # Category explorer & leaderboard product images
│   ├── team/                      # Executive leadership portraits
│   ├── blog/                      # Hardware retail analytics article covers
│   ├── cases/                     # Case study visuals
│   ├── ui/                        # Feature deep-dives & section backgrounds
│   └── IMAGE-MANIFEST.md          # Verification ledger of all 42 local assets
└── assets/
    ├── css/
    │   ├── tokens.css             # Circuit-Noir Neon design tokens & light theme
    │   ├── base.css               # Resets, @font-face, cursor glow, preloader
    │   ├── components.css         # 3D tilt cards, center alignment, nav, animations
    │   ├── pages.css              # Page layouts (Hero mock, timeline, leaderboard)
    │   └── dashboard.css          # SPA shell, sidebar, tables, print-to-PDF styles
    ├── js/
    │   ├── main.js                # Core controller: nav, theme, cursor, counters, tabs
    │   ├── tilt.js                # Reusable 3D tilt module with specular glare
    │   ├── charts.js              # Theme-aware Chart.js integration & sparklines
    │   ├── auth.js                # Demo accounts, session state & role permissions
    │   ├── dashboard.js           # SPA hash routing, CRUD inventory, health gauge
    │   ├── export.js              # CSV, Excel (BOM), and PDF export engine
    │   └── vendor/
    │       └── chart.umd.js       # Local Chart.js v4.4.1 (Zero-CDN)
    ├── fonts/                     # 8 Local TTF font files (Space Grotesk, Inter, JetBrains)
    └── data/
        ├── products.json          # 65 realistic fictional gadgets with IMEI/margins
        ├── users.json             # Seeded accounts & RBAC permissions matrix
        └── reports.json           # Sample audit templates & scheduled jobs
```

---

## 🏆 Deliverable Checklist Verification

- [x] **Navigation Bar:** Shows strictly 4 links (`Home`, `Platform`, `Insights`, `Contact`); every page features 10+ rich sections.
- [x] **Brand & Theme:** Original VOLTARIS circuit monogram logo + favicon; Circuit-Noir Neon theme with functional light/dark switcher.
- [x] **3D Tilt Architecture:** Applied to all card types (`data-tilt`); cards are strictly center-aligned across all responsive breakpoints; rotating electronics animations on every card.
- [x] **Operational Dashboard:** 6 hash-routed SPA views with role-based access enforcement, realistic CRUD inventory table, live health gauge, and working CSV, Excel, and PDF exports.
- [x] **Local Image Integrity:** 42 local, high-quality images in `/images/`; zero external URLs; documented in `IMAGE-MANIFEST.md` with zero repeated images.
- [x] **Performance & Quality:** Zero CDN dependencies, local fonts, responsive from 360px to 1920px, accessible ARIA attributes, semantic SEO tags, and zero console errors.
