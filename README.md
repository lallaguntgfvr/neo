# NEAPOLITAN STATION

A hand-coded Neocities homepage in pink, chocolate and cream. Static files only — no build
step, no `npm install`, no framework, no trackers, no CDN. Open `index.html` straight off
your hard drive and it works.

```
neo/
├── index.html                     the whole homepage
├── 404.html                       custom not-found page
├── style.css                      all styling (one file, commented, 18 sections)
├── script.js                      all behaviour (plain JS, no dependencies)
├── assets/
│   ├── bg-plaid.png               seamless plaid wallpaper tile (hand-drawn)
│   ├── bg-motifs.png              tileable hearts/notes/cats/dots overlay
│   ├── avatar.png  hero.png …     the neon "NOVA STATION" draft's artwork (kept)
│   ├── photo-cat.jpg              gallery + welcome photos
│   ├── photo-cake.jpg
│   ├── photo-shake.jpg
│   ├── photo-desk.jpg
│   ├── button-neapolitan.png      your own 88×31 button
│   ├── icons/                     13 tiny hand-drawn icons (16px each)
│   └── fonts/                     self-hosted Silkscreen + its OFL licence
├── .tools/smoke-test.mjs          optional headless test (never uploaded)
├── deploy/neocities-workflow.yml   optional auto-deploy (copy to .github/workflows/)
└── _archive/nova-station/          the earlier neon draft, kept for reference
```

## The layout

Two widget columns either side of the main column, on a plaid wallpaper — the classic
personal-homepage shape:

| Column | Widgets |
| --- | --- |
| **Left** | Station time (live clock), mini calendar, navigate buttons, current status (mood + meters), to-do list |
| **Middle** | Live transmission strip, welcome panel with photo, about me, latest entries & favourite recipes, photo gallery, guestbook, links |
| **Right** | Colour palette (click a swatch to copy its hex), currently (fake player with dancing EQ), buttons, cat of the day, site traffic (visit counter + mood) |

## What actually works

- **Guestbook** — saves entries to `localStorage`, remembers your handle, HTML-escapes
  everything, refuses empty submissions, shows "2 hours ago" style timestamps.
- **Mini calendar** — built from the real date, highlights today.
- **To-do list** — click any item (or press Enter) to tick it off and back on.
- **Colour palette** — hover to name a colour, click to copy its hex code.
- **Fake music player** — play/pause the EQ bars, shuffle the playlist.
- **Cat of the day**, **live transmission**, **mood meters**, **visit counter**.
- **Confetti** — click the station name in the header.
- Works **without JavaScript**: the widgets keep their starting values and the page still
  reads perfectly. All animation respects `prefers-reduced-motion`.

## Preview it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it on Neocities

### Option A — drag and drop (fastest)

1. Log in at [neocities.org](https://neocities.org) and open your site's dashboard.
2. Click **Upload** and drag in `index.html`, `404.html`, `style.css`, `script.js`, and the
   whole `assets` folder with its subfolders.
3. Visit `https://YOUR-NAME.neocities.org`.

Keep the folder structure identical — `assets/` and `assets/icons/` must stay subfolders or
the pictures and icons will 404. Don't upload `_archive/`, `.tools/` or `deploy/`.

### Option B — automatic deploys (GitHub Actions)

**First, enable the workflow:** in GitHub go to **Add file → Create new file**, name it
`.github/workflows/deploy-neocities.yml`, then paste in the contents of
`deploy/neocities-workflow.yml`. (It ships in `deploy/` so it can be reviewed and added by
you in one click.)

Then:

1. Get your API key from `https://neocities.org/settings/YOUR-SITE#api_key`.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name
   it `NEOCITIES_API_TOKEN`, paste the key.
3. Push to `main` — every future push redeploys the site.

## Make it yours

**Colours** — `style.css`, section 2 (`:root`). Six tokens control everything:

```css
--cream:     #fdf6ec;   /* panel interiors   */
--blush:     #f2cfd4;   /* buttons, accents  */
--rose:      #e2aab2;   /* title bars        */
--rose-dark: #b4708c;   /* links, labels     */
--chocolate: #6c4028;   /* headings, buttons */
--choc-dark: #4a2c1a;   /* borders, wallpaper */
```

**Wallpaper** — `assets/bg-plaid.png` and `assets/bg-motifs.png` are seamless 600px tiles.
Replace either with your own (keep them square and seam-free) and the whole background
changes. Drop `--wallpaper` in `:root` to shrink or grow the pattern.

**Name and text** — search `index.html` for `NEAPOLITAN STATION` and `lallaguntgfvr`.

**Photos** — replace the four `assets/photo-*.jpg` files, keeping the 240×240 size, and the
gallery, welcome panel and cards all follow.

**Icons** — `assets/icons/*.png` are 32px files displayed at 16px (crisp on retina). Swap in
your own; the file names are referenced in `index.html`.

**Guestbook** — seed signatures are in `SEED_ENTRIES` at the top of section 9 in
`script.js`. Delete the array to start empty. Entries live in each visitor's own browser;
there's no server and nothing is sent anywhere. For real shared entries on a static host
you'd need a third-party form service (e.g. Formspree).

## Testing changes (optional)

`.tools/smoke-test.mjs` runs a page in jsdom and exercises every widget — clock, calendar,
transmission, status meters, player, palette, to-do list, cat, guestbook validation and
escaping, visit counter, confetti — and fails if anything throws.

```bash
npm install --no-save jsdom
node .tools/smoke-test.mjs             # index.html:  50 checks
node .tools/smoke-test.mjs 404.html    # error page:  10 checks
```

Nothing in `.tools/` is uploaded to Neocities.

## Notes

- **No external requests.** Fonts, icons, wallpaper, photos and scripts are all served from
  your own Neocities folder. That's why it loads instantly on the free tier, and why no
  visitor data leaks to a third party.
- **Fonts** are self-hosted Silkscreen by Jason Kottke (SIL Open Font License 1.1 — licence
  text in `assets/fonts/`), used only for headings, buttons and small labels.
- **The visit counter is honest but local.** A static host can't count visits across
  visitors, so it counts *your* visits. The page says so out loud.
- **Accessibility touches:** skip link, labelled form fields and widgets, keyboard-operable
  to-do list and palette, visible focus outlines, `aria-live` status regions, reduced-motion
  support.

## Credits and license

Code: do whatever you like with it — copy it, gut it, learn from it. No credit needed,
credit gladly accepted.

Artwork and photos: made for this site and free to reuse. Swap them for your own.

The earlier neon "NOVA STATION" build is kept intact in `_archive/nova-station/` in case you
want anything from it.
