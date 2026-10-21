# Gufran Ansari — Portfolio

Static portfolio site for **Gufran Ansari**, Technical Project Manager with a web-development background. Built as a hand-rolled multi-page site: no framework, no bundler, no build step — just semantic HTML, modern CSS and vanilla ES modules.

- **Live site:** `https://your-domain.com/` _(replace with the live domain — see [Deployment](#deployment))_
- **Pages:** Home · Projects · About
- **Contact:** ansarigufran302@gmail.com · [WhatsApp](https://wa.me/919762146370) · [LinkedIn](https://linkedin.com/in/gufran-ansari)

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Markup | Semantic HTML5, one file per page |
| Styling | Plain CSS with custom properties (no preprocessor) |
| Behaviour | Vanilla ES modules (`<script type="module">`) |
| Animation | GSAP 3 + ScrollTrigger |
| Smooth scroll | Lenis |
| Type reveal | SplitType |
| Icons | Lucide (UMD, replaces `<i data-lucide="…">` at runtime) |
| Fonts | Inter + Space Grotesk (Google Fonts) |
| Cursor | Custom cursor with contextual states |

Everything else is hand-written: the cursor, the filters, the card hover auto-scroll, the CTA reveal, the marquee.

---

## Getting started

The shared header, footer and popup are injected at runtime with `fetch()`, so **the site must be served over http(s)** — opening the HTML files straight from disk (`file://`) blocks those requests.

```bash
# any static server works
npx serve .
python3 -m http.server 8000
# or VS Code "Live Server"
```

Then open <http://localhost:8000>.

---

## Project structure

```
.
├── index.html              # Home
├── projects.html           # Projects archive (filterable grid)
├── about.html              # About
├── sitemap.xml             # Search-engine sitemap
├── robots.txt              # Crawler rules
│
├── components/             # Shared markup, injected at runtime
│   ├── header.html
│   ├── footer.html
│   ├── contact-popup.html
│   └── loader.html
│
├── css/                    # Load order matters (see below)
│   ├── variables.css       # Design tokens (colours, type scale, spacing)
│   ├── reset.css
│   ├── typography.css
│   ├── layout.css          # Container, section, navigation
│   ├── components.css      # Cards, buttons, CTA, footer …
│   ├── animations.css
│   ├── cursor.css          # Custom cursor
│   ├── home.css
│   ├── projects.css
│   └── responsive.css
│
├── js/                     # ES modules, entry point js/app.js
│   ├── app.js              # Bootstrap: loads components, calls init* fns
│   ├── utils.js            # qs/qsa, loadComponent, debounce, lerp
│   ├── animations.js       # GSAP timelines per section
│   ├── cursor.js           # Custom cursor + hover states
│   ├── navigation.js       # Mobile nav, scroll state
│   ├── scroll.js           # Lenis smooth scroll
│   ├── hero.js
│   ├── projects.js         # Category filters + projects hero
│   ├── counters.js
│   ├── gallery.js
│   └── marquee.js
│
└── assets/
    ├── images/             # Photos
    │   └── projects/       # One screenshot per project card
    ├── icons/              # (unused — safe to delete)
    └── resume/
        └── Gufran_Ansari_Resume.pdf
```

---

## Design system

All tokens live in `css/variables.css` under `:root`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-accent` | `#134e4a` | Primary green — buttons, active states, CTA card |
| `--color-bg` | `#fdfdfd` | Page background |
| `--color-text-primary` | `#18181B` | Headings, body copy |
| `--color-text-secondary` | `#71717A` | Muted copy |
| `--color-border` | `#E4E4E7` | Hairlines, card edges |
| `--font-heading` | Space Grotesk | Display headings |
| `--font-editorial` | Inter | Body, eyebrow labels |
| `--radius-pill` | `999rem` | Pill buttons |

### Stylesheet load order

```html
<link rel="stylesheet" href="css/variables.css?v=8" />
<link rel="stylesheet" href="css/reset.css" />
<link rel="stylesheet" href="css/typography.css?v=6" />
<link rel="stylesheet" href="css/layout.css?v=5" />
<link rel="stylesheet" href="css/components.css?v=27" />
<link rel="stylesheet" href="css/animations.css?v=8" />
<link rel="stylesheet" href="css/cursor.css?v=3" />
<link rel="stylesheet" href="css/home.css?v=7" />   <!-- pages only -->
<link rel="stylesheet" href="css/responsive.css?v=9" />
```

Page-specific sheets (`home.css`, `projects.css`) load between `cursor.css` and `responsive.css` so they can override component styles but still yield to the responsive layer. The `?v=N` query strings are cache-busting — **bump the version whenever you edit a stylesheet**, otherwise returning visitors keep the cached copy.

---

## Adding a project

Projects are plain markup in the `.projects-grid` inside `projects.html`. Copy an existing `<a class="projects-card">` block, then:

1. **Drop the screenshot** into `assets/images/projects/<slug>.webp` (WebP, ~300 KB max — the cards are 4:5 vertical and the image is revealed by scrolling on hover).
2. **Copy the card block** and update:
   - `href` — the live project URL (`target="_blank" rel="noopener noreferrer"`)
   - `src` / `alt` — image path and a descriptive alt text
   - `data-category` — `web-development`, `ecommerce` or `custom-html`
   - the category label — `Dynamic Website • WordPress`, `eCommerce Store • WordPress`, etc.
   - the `<h3>` title
3. **Update the filter counts** in the filter bar so they match the actual number of cards in each category.

```html
<a
  href="https://example.com/"
  target="_blank"
  rel="noopener noreferrer"
  class="projects-card"
  data-category="web-development"
  data-cursor="card"
  aria-label="View Example Co - Dynamic Website on WordPress"
>
  <div class="projects-card__screen">
    <img
      src="assets/images/projects/example.webp"
      alt="Example Co Website Preview"
      loading="lazy"
      decoding="async"
      class="projects-card__img"
    />
  </div>
  <div class="projects-card__scrim" aria-hidden="true"></div>
  <div class="projects-card__bottom">
    <span class="projects-card__category">Dynamic Website • WordPress</span>
    <div class="projects-card__title-row">
      <h3 class="projects-card__title">Example Co</h3>
      <span class="projects-card__arrow" aria-hidden="true">…</span>
    </div>
  </div>
</a>
```

The filtering itself needs no JavaScript change — `js/projects.js` matches `card.dataset.category` against the clicked pill's `data-filter`.

---

## Deployment

The site is fully static — upload the folder as-is to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or plain nginx/Apache).

Before going live:

1. **Replace the base URL** in `sitemap.xml` and `robots.txt`:
   ```bash
   grep -rl "your-domain.com" .        # find every placeholder
   ```
2. **Add canonical + Open Graph tags** to the `<head>` of `index.html`, `projects.html` and `about.html` — the current markup has title/description only:
   ```html
   <link rel="canonical" href="https://your-domain.com/projects.html" />
   <meta property="og:title" content="…" />
   <meta property="og:url" content="https://your-domain.com/projects.html" />
   <meta property="og:image" content="https://your-domain.com/assets/images/gufran-ansari-intro.webp" />
   ```
3. **Set the default document** to `index.html` if your host needs it.
4. **Confirm `sitemap.xml` and `robots.txt` are served at the root** (they must be at `https://your-domain.com/sitemap.xml`).

### Per-page cache busting

`js/app.js` is loaded with a version query (`?v=20`, `?v=21`). Bump it when you change JS:

```html
<script type="module" src="js/app.js?v=22"></script>
```

---

## Known issues / TODOs

- `assets/images/projects/guruproperty.webp` is referenced by the Guru Property card but **the file is missing** — that card's thumbnail 404s until the asset is added.
- `assets/images/projects/plan a giift.webp` has a space in the filename and is reached through the `plan-a-giift.webp` symlink. Rename the real file to `plan-a-giift.webp` and drop the symlink so the URL never needs `%20`.
- `assets/icons/` contains 14 SVGs that nothing references — safe to delete.
- `index-old.html` is a superseded snapshot of the home page — safe to delete.
- Tooling directories (`.gsd/`, `scripts/`, `adapters/`) are dev-only. Either delete them or exclude them from the deploy so they don't ship.

---

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari 15+). Uses `:has()`, CSS nesting-free custom properties, `clamp()` and ES modules.

Touch and coarse-pointer devices fall back to the system cursor (`js/cursor.js` bails out via `isCoarsePointer()`) and `prefers-reduced-motion` disables the scroll animations and transitions.

---

## License

Personal portfolio — all rights reserved. The code is original; the project screenshots belong to their respective owners.
