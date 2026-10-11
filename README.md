# NOVA STATION

A hand-coded Neocities homepage. Static files only — no build step, no npm install, no
framework, no trackers, no CDN. You can open `index.html` straight off your hard drive and
it just works.

```
neo/
├── index.html                          the whole homepage
├── 404.html                            custom not-found page
├── style.css                           all styling (one file, commented, 18 sections)
├── script.js                           all behaviour (plain JS, no dependencies)
├── assets/
│   ├── avatar.png                      pixel cat astronaut portrait
│   ├── hero.png                        neon skyline banner behind the header
│   ├── gal-1..3.png                    gallery sprites
│   ├── button-novastation.png          your own 88×31 button
│   └── fonts/
│       ├── silkscreen-latin-400-normal.woff2
│       ├── silkscreen-latin-700-normal.woff2
│       └── Silkscreen-OFL.txt          font license (SIL OFL 1.1)
├── .tools/smoke-test.mjs               optional headless test (not uploaded)
└── deploy/neocities-workflow.yml       optional auto-deploy (copy to .github/workflows/)
```

## What's on the page

| Section | What it does |
| --- | --- |
| Taskbar | Sticky nav styled like a 90s window chrome, live clock, CRT scanline toggle |
| Hero | Avatar, animated gradient wordmark, status line, scrolling marquee |
| `welcome.txt` | Intro, pull quote, square-bullet list, tag pills |
| `about.me` | Bio, quick-facts definition list |
| `gallery` | Three pixel-art pieces with captions and tags |
| `guestbook` | Working guestbook saved to `localStorage` — pure client side |
| `links.html` | Webring strip, neighbour links, copy-paste code for your 88×31 button |
| Sidebar | `status.exe` mood bubble, fake "now playing" player with dancing EQ bars, status list, badge wall |
| Footer | Honestly-labelled visit counter (counted in *your* browser) |

Extras: custom 404 page, Konami code party mode, click the cat for pixel confetti,
scroll reveals, `prefers-reduced-motion` support, keyboard-focus styles, skip link.

## Preview it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html`.

## Put it on Neocities

### Option A — drag and drop (fastest, no tools)

1. Log in at [neocities.org](https://neocities.org) and open your site's dashboard.
2. Click **Upload**, then drag in `index.html`, `404.html`, `style.css`, `script.js`, and
   the `assets` folder *with its contents*.
3. Visit `https://YOUR-NAME.neocities.org`.

Keep the folder structure identical — `assets/` must stay a subfolder, or the images and
fonts will 404.

### Option B — automatic deploys from this repo (GitHub Actions)

**First, enable the workflow:** in GitHub, go to **Add file → Create new file**, name it
`.github/workflows/deploy-neocities.yml`, then paste in the contents of
`deploy/neocities-workflow.yml` from this repo. (It ships in `deploy/` so that the file
can be reviewed, and added by you with one click in the web editor.)

Then:

1. Grab your API key from `https://neocities.org/settings/YOUR-SITE#api_key`.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
   Name it `NEOCITIES_API_TOKEN`, paste the key.
3. Push to `main`. Every future push redeploys the site.

### Option C — the Neocities CLI

```bash
npm install -g neocities
neocities login
cd /path/to/this/folder
neocities upload -d . index.html 404.html style.css script.js assets/avatar.png
# ...or just use Option A, honestly
```

## Make it yours

Everything worth editing is at the top of each file.

**Colours** — `style.css`, section 2 (`:root`):

```css
--pink: #ff4fd8;
--cyan: #53f2ff;
--violet: #a678ff;
```

Change those three and the whole site re-skins: windows, buttons, badges, marquee.

**Your name and site title** — search `index.html` for `NOVA STATION` and
`lallaguntgfvr`. Both appear in the `<title>`, the hero, the footer, and the `about.me`
panel.

**Your own artwork** — drop replacements into `assets/` using the same filenames
(`avatar.png` 128×128, `gal-1.png` 176×176, `hero.png` 768×256) and the layout keeps its
shape. Scale pixel art with nearest-neighbour so it stays crisp:

```css
img { image-rendering: pixelated; }   /* already applied where it matters */
```

**The gallery** — each piece is a `<figure class="piece">` block in `index.html`. Copy one,
change the image, title, meta line, and tags.

**The guestbook** — seed signatures live in `SEED_ENTRIES` at the top of section 6 in
`script.js`. Delete the array to start empty. Writes are saved per-visitor in their own
browser via `localStorage`; there is no server, so nothing is sent anywhere. If you later
want real shared entries, Neocities has no backend — you'd need a free form service such
as Formspree or a comments script.

**The links page** — swap the four `.neighbor` links for sites you actually read, and
update the webring strip (it's decorative until you join a real ring).

**The button** — `assets/button-novastation.png` is a real 88×31 button. Upload it and
swap `YOUR-NAME` in the code snippet on the links panel.

## Testing changes (optional)

`.tools/smoke-test.mjs` runs the page in jsdom and exercises every interactive piece —
clock, CRT toggle, status bubble, player, guestbook validation and escaping, hit counter,
reveals, easter eggs — and fails if anything throws.

```bash
npm install --no-save jsdom
node .tools/smoke-test.mjs
```

Nothing in `.tools/` is uploaded to Neocities.

## Notes

- **Fonts** are self-hosted (Silkscreen by Jason Kottke, SIL Open Font License 1.1 —
  license text in `assets/fonts/`). No Google Fonts request, so the page never leaks a
  visitor to a third party.
- **No external requests at all.** Every image, font, and script is served from your own
  Neocities folder, which is why the site loads in a blink on the free tier.
- **JavaScript is optional.** With JS off you lose the guestbook, the counter, the clock,
  and the CRT toggle; the page still reads perfectly.
- **The hit counter is honest but local.** A static host can't count visits across
  visitors, so it counts *your* visits. If you want a real counter, Neocities' own
  dashboard shows site stats.
- **Accessibility touches** include a skip link, labelled form fields, focus outlines,
  `aria-live` status regions, and a reduced-motion mode.

## Credits and license

Code in this repository: do whatever you like with it — copy it, gut it, learn from it.
No credit needed, credit gladly accepted.

Artwork: generated for this site and free to reuse. Swap it for your own when you can —
that's half the fun.
