# Gayatri Bodke — portfolio

Static portfolio site. No build step, no dependencies, no server. `index.html` is the homepage.

## Deploy

**GitHub Pages**

1. Push the **contents** of this folder to a repo (root, not a subfolder).
2. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. The site is live at `https://<username>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves every file as-is.

Netlify, Vercel and Cloudflare Pages work the same way: drop this folder in, no build command, publish directory = root.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home — hero, selected work, writing, how I work, outside of work, contact |
| `about.html` | About — how I work, tools, outside of work |
| `aarogyam.html` | Aarogyam case study (passcode gated) |
| `tvak.html` | Indus Derma case study (passcode gated) |
| `mai.html` | Mai case study (NDA overview) |
| `sts.html` | STS case study (open) |
| `articles.html` | Writing index |
| `article-onboarding.html` | Progressive onboarding article (also published on Medium) |
| `Gayatri-Bodke-Resume.pdf` | Resume, opens in a new tab |

Case studies link in a loop: Aarogyam → Indus Derma → Mai → STS → Aarogyam.

## Shared files

- `support.js`, `page-loader.js` — page runtime and transitions, needed by every page
- `case-nav.js` — side rail and back-to-top on case studies
- `case-confidential.js` — passcode gate on the NDA case studies (code rotates monthly: `gayatri-` + month + year, e.g. `gayatri-sep26`; current and previous month both work; access lasts 14 days per browser). "Request the full study" opens a form: the request is emailed to gayatribodke18@gmail.com via FormSubmit and the visitor gets the passcode by auto-reply. The very first request triggers a one-time FormSubmit activation email; click it to switch the form on.
- `theme-toggle.js` — light/dark switch, remembered per visitor
- `assets/` — all images

## External links

- Writing rows point to the published Medium post.
- "Medium ↗" links point to the profile: `medium.com/@gayatribodke18`.

## Not included

- Ojas is still in progress.
- The health-notifications article is written but unpublished, so it is left out of this build and out of the writing index.

## Updating

Edit the source `.dc.html` files in the project root, then ask for this folder to be
rebuilt. Editing files in here directly means the next rebuild overwrites them.
