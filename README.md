# Adonay Michale — Personal Portfolio

A production-ready personal portfolio for internships, graduate programs, research
opportunities, and international companies. Apple-inspired premium **dark** UI.

Built with vanilla HTML/CSS/JS (frontend) and an Express.js backend for the contact system.

---

## Highlights

- **Apple-inspired dark design** — minimal, premium, elegant. Color system, typography,
  and spacing follow the brief (`#09090B` background, Inter / Playfair Display / Space Grotesk).
- **Authenticity first** — no fabricated experience. Missing information shows
  `To Be Updated` / `Add Information Here`.
- **Dynamic sections** — Journey, Projects, Certificates, and Gallery render from a single
  manifest (`data/content.js`). With the backend enabled, Certificates and Gallery also
  auto-list files dropped into `assets/`.
- **Profile image** with floating animation + gradient ring + soft shadow, and an elegant
  placeholder silhouette when the image is missing.
- **Gallery & Certificates** with lightbox / fullscreen view, hover lift, and download.
- **Resume viewer** — embedded PDF with Download / Open-in-new-tab; shows
  `Resume Coming Soon` when the file is missing.
- **Contact system** with Express backend (`/api/contact`, `/api/upload`, `/api/status`),
  email validation, rate limiting, honeypot spam protection, and file attachment support.
- **Accessible** — semantic HTML, ARIA labels, keyboard nav, visible focus, reduced-motion support.
- **Responsive** — desktop, laptop, tablet, mobile.
- **SEO** — meta tags, Open Graph, Twitter cards, JSON-LD structured data.

---

## Folder structure

```
.
├── index.html              # All sections (single-page, anchored nav)
├── style.css               # Premium dark design system
├── script.js               # Animations, lightbox, dynamic render, contact
├── data/
│   └── content.js          # Content manifest (edit this to update the site)
├── server.js               # Express backend
├── package.json
├── .env.example
├── assets/
│   ├── images/
│   │   └── portrait.jpg    # Profile image (optional — placeholder if missing)
│   ├── gallery/
│   │   ├── tedx/
│   │   ├── model-un/
│   │   ├── finance/
│   │   └── other/
│   ├── certificates/
│   └── documents/
│       └── Adonay_Michale_CV.pdf
└── uploads/                # Created at runtime for contact attachments (gitignored)
```

All image paths are **relative** — the site works from any subpath (GitHub Pages included).

---

## Getting started (local)

```bash
npm install
cp .env.example .env        # then fill in SMTP + CONTACT_EMAIL
npm start                   # serves frontend + API on http://localhost:3000
```

The frontend is served statically by `server.js`. Open http://localhost:3000.

> Without SMTP configured, contact messages are **logged to the server console**
> instead of emailed — useful for local testing.

---

## Editing your content

Open `data/content.js`. It is the single source of truth:

- `profile.interests` — chips on the About section.
- `journey` — education/experience timeline (real entries only).
- `projects` — selected work cards.
- `certificates` — certificate cards. Point `file` at `assets/certificates/...`.
- `gallery` — grouped photo sections (TEDx, Model UN, Finance, Leadership, Events).
- `contact` — set `apiBase` to your deployed backend URL, or use a static service
  (`formspree` / `web3forms`) by setting `formService` + `formEndpoint`.

**Rules:** never invent experience, companies, certificates, education, or projects.
Leave missing fields as `To Be Updated` / `Add Information Here`.

### Adding images

1. Drop files into the matching `assets/...` folder.
2. Reference them in `data/content.js` (or, with the backend enabled, they are auto-listed).
3. Supported: `jpg`, `jpeg`, `png`, `webp` (certificates also support `pdf`).

---

## Frontend deployment — GitHub Pages

1. Push the repo to GitHub.
2. **Settings → Pages → Build & deployment → Source: Deploy from a branch**.
3. Choose `main` (or `master`) and `/root`, then **Save**.
4. Your site is live at `https://<user>.github.io/<repo>/`.

Update the Open Graph / Twitter `og:url` and `twitter:image` in `index.html`
with your real GitHub Pages URL.

> GitHub Pages is static — the contact form needs the backend below, or a
> static service (Formspree / Web3Forms) configured in `data/content.js`.

---

## Backend deployment — Render (or Railway)

**Render (Web Service):**
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example` (SMTP + `CONTACT_EMAIL`).
- Set `CORS_ORIGIN` to your GitHub Pages URL.
- Copy the generated URL and set `contact.apiBase` in `data/content.js`
  (and redeploy the frontend) so the contact form uses it.

**Railway:** import the repo, set the same env vars, deploy.

### API endpoints

| Method | Endpoint          | Purpose                                  |
|--------|-------------------|------------------------------------------|
| POST   | `/api/contact`    | Receive + email contact messages         |
| POST   | `/api/upload`     | Accept file uploads (attachments)        |
| GET    | `/api/status`     | Health check                             |
| GET    | `/api/certificates` | List `assets/certificates/` files      |
| GET    | `/api/gallery`    | List `assets/gallery/` files by group    |

Features: email validation, rate limiting (per IP), honeypot spam protection,
multipart file upload (8 MB/file), error handling, safe temp-file cleanup.

---

## Notes on honesty

This portfolio is designed to represent a **real** person truthfully. Every placeholder
is intentional. Replace placeholders with your actual history — never invent it.

---

## Tech

Frontend: HTML5, CSS3, vanilla JavaScript (IntersectionObserver, Fetch, FormData).
Backend: Node.js, Express, Multer, Nodemailer, express-rate-limit.
