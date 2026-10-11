/* ---------------------------------------------------------------------------
   NEAPOLITAN STATION — headless smoke test
   ---------------------------------------------------------------------------
   Runs a page in jsdom and exercises every widget it contains, so changes to
   script.js can be checked without opening a browser.

   Run:
     npm install --no-save jsdom
     node .tools/smoke-test.mjs              # tests index.html
     node .tools/smoke-test.mjs 404.html     # tests the error page

   Widget groups that a page doesn't contain are skipped, so the same suite
   covers every page. Not uploaded to Neocities — see README.
   --------------------------------------------------------------------------- */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = process.argv[2] || 'index.html';

let JSDOM, VirtualConsole;
try {
  ({ JSDOM, VirtualConsole } = await import('jsdom'));
} catch {
  console.error('jsdom is not installed. Run:  npm install --no-save jsdom');
  process.exit(2);
}

// NOTE: the replacer must be a function — script.js is full of `$('...')`
// selectors, and `$'` inside a replacement STRING means "rest of the document".
const inlineScript = readFileSync(join(root, 'script.js'), 'utf8');
const source = readFileSync(join(root, page), 'utf8');
const html = source.replace('<script src="script.js"></script>', () => `<script>${inlineScript}</script>`);

const errors = [];
const virtualConsole = new VirtualConsole()
  .on('jsdomError', (e) => errors.push(`jsdomError: ${e.message}`))
  .on('error', (...args) => errors.push(`console.error: ${args.join(' ')}`));

const dom = new JSDOM(html, {
  url: 'https://neapolitan-station.neocities.org/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole
});

const { window } = dom;
const { document } = window;

const pass = [];
const fail = [];
const skipped = [];

const check = (label, condition, detail = '') => {
  (condition ? pass : fail).push(label + (detail && !condition ? `  (${detail})` : ''));
};
const section = (selector, fn) => {
  if (document.querySelector(selector)) fn();
  else skipped.push(selector);
};
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const key = (el, k) => el.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));
const text = (sel) => document.querySelector(sel)?.textContent ?? '';

await new Promise((r) => window.addEventListener('load', r));

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];
const now = new Date();

/* --- page shell ---------------------------------------------------------- */
check('stylesheet is linked', Boolean(document.querySelector('link[rel="stylesheet"][href="style.css"]')));
// the harness swaps the <script src> tag for an inline copy, so assert against
// the source file, then prove the script really ran below.
check('page loads script.js', source.includes('<script src="script.js"></script>'));
check('head script ran (js class set)', document.documentElement.classList.contains('js'));
check('skip link present', Boolean(document.querySelector('.skip-link')));
check('main landmark present', Boolean(document.querySelector('main')));
check('nav links are all resolvable targets',
  [...document.querySelectorAll('.topnav a')].every((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return true;
    if (href === '#top') return Boolean(document.querySelector('.site, #top'));
    return Boolean(document.querySelector(href));
  }),
  [...document.querySelectorAll('.topnav a')].map((a) => a.getAttribute('href')).join(' '));
check('only local asset paths are used (no third-party requests)',
  [...document.querySelectorAll('img[src], link[href]')]
    .map((el) => el.getAttribute('src') || el.getAttribute('href'))
    .filter((v) => v && !v.startsWith('data:'))
    .every((v) => !/^https?:\/\//.test(v)));

/* --- station clock ------------------------------------------------------- */
section('.clock-time', () => {
  check('clock shows a time', /\d{1,2}:\d{2}:\d{2} (am|pm)/.test(text('#clock')), text('#clock'));
  check('clock spells out the date',
    new RegExp(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`, 'i').test(text('#clock-date')),
    text('#clock-date'));
});

/* --- mini calendar ------------------------------------------------------- */
section('#cal-body', () => {
  const body = document.querySelector('#cal-body');
  const cells = [...body.querySelectorAll('td')];
  const rows = body.querySelectorAll('tr');
  const todayCell = body.querySelector('.is-today');

  check('calendar has 4-6 week rows', rows.length >= 4 && rows.length <= 6, `${rows.length} rows`);
  check('calendar cells fill whole weeks', cells.length % 7 === 0, `${cells.length} cells`);
  check('calendar marks exactly one day as today', body.querySelectorAll('.is-today').length === 1);
  check('calendar highlight is today', todayCell && Number(todayCell.textContent) === now.getDate(),
    todayCell && todayCell.textContent);
  check('calendar heading matches the real month',
    text('#cal-month').toLowerCase().startsWith(MONTHS[now.getMonth()]), text('#cal-month'));
  check('day 1 sits in the right weekday column',
    cells.findIndex((c) => c.textContent === '1') % 7 === new Date(now.getFullYear(), now.getMonth(), 1).getDay());
});

/* --- live transmission --------------------------------------------------- */
section('#transmission', () => {
  const tx = document.querySelector('#transmission');
  const first = tx.textContent;
  click(document.querySelector('#tx-btn'));
  check('transmission advances', tx.textContent !== first, `${first} -> ${tx.textContent}`);
  check('transmission announces the change', tx.classList.contains('is-new'));
});

/* --- status + meters ----------------------------------------------------- */
section('#status-bubble', () => {
  const bubble = document.querySelector('#status-bubble');
  const first = bubble.textContent;
  click(document.querySelector('#status-btn'));
  check('poking the status changes the mood', bubble.textContent !== first);
  const widths = [...document.querySelectorAll('.meter i')].map((i) => i.style.width);
  check('meters are drawn with widths', widths.length > 0 && widths.every((w) => /%$/.test(w)), widths.join(','));
});

/* --- currently playing --------------------------------------------------- */
section('#track-title', () => {
  const title = document.querySelector('#track-title');
  const playBtn = document.querySelector('#play-btn');
  click(playBtn);
  check('play toggles is-playing', document.body.classList.contains('is-playing'));
  check('play button offers PAUSE', /PAUSE/.test(playBtn.textContent), playBtn.textContent);
  check('pressed state is exposed', playBtn.getAttribute('aria-pressed') === 'true');
  click(playBtn);
  check('pause clears is-playing', !document.body.classList.contains('is-playing'));

  const before = title.textContent;
  let changed = false;
  for (let i = 0; i < 20 && !changed; i += 1) {
    click(document.querySelector('#shuffle-btn'));
    changed = title.textContent !== before;
  }
  check('next track changes the song', changed, title.textContent);
});

/* --- colour palette ------------------------------------------------------ */
section('#palette', () => {
  const swatches = [...document.querySelectorAll('#palette li')];
  const name = document.querySelector('#palette-name');
  check('palette has six swatches', swatches.length === 6, `${swatches.length}`);
  swatches[2]?.dispatchEvent(new window.MouseEvent('mouseenter'));
  check('hovering a swatch names it', /dusty rose/.test(name.textContent), name.textContent);
  check('swatches are keyboard reachable', swatches.every((s) => s.getAttribute('tabindex') === '0'));
});

/* --- to-do list ---------------------------------------------------------- */
section('.checklist', () => {
  const items = [...document.querySelectorAll('.checklist li')];
  const done = items.find((li) => li.querySelector('img')?.alt === 'done');
  const todo = items.find((li) => li.querySelector('img')?.alt === 'todo') || items[0];

  click(todo);
  const ticked = todo.querySelector('img').alt === 'done';
  click(todo);
  const unticked = todo.querySelector('img').alt === 'todo';

  if (done) {
    check('completed items are struck through', Boolean(done.querySelector('s')));
    key(done, 'Enter');
    check('a to-do can be toggled with the keyboard', done.querySelector('img').alt === 'todo');
  }
  check('clicking a to-do ticks it off', ticked, todo.querySelector('img').alt);
  check('clicking again unticks it', unticked, todo.querySelector('img').alt);
});

/* --- cat of the day ------------------------------------------------------ */
section('#cat-note', () => {
  const note = document.querySelector('#cat-note');
  const first = note.textContent;
  click(document.querySelector('#cat-btn'));
  check('the cat has more to say', note.textContent !== first, note.textContent);
});

/* --- guestbook ----------------------------------------------------------- */
section('#gb-form', () => {
  const list = document.querySelector('#gb-list');
  const form = document.querySelector('#gb-form');
  const nameInput = document.querySelector('#gb-name');
  const msgInput = document.querySelector('#gb-msg');
  const status = document.querySelector('#gb-status');
  const submit = () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

  check('guestbook seeds 3 entries', list.querySelectorAll('.gb-entry').length === 3,
    `${list.querySelectorAll('.gb-entry').length}`);
  check('guestbook total reads (3)', text('#gb-total') === '(3)');

  submit();
  check('empty submit is refused', /Both boxes/.test(status.textContent), status.textContent);

  nameInput.value = 'tester';
  submit();
  check('name-only submit is refused', /Both boxes/.test(status.textContent));

  nameInput.value = '  smoke_tester  ';
  msgInput.value = '  hello <script>alert(1)</script> from the harness  ';
  submit();
  check('valid submit adds an entry', list.querySelectorAll('.gb-entry').length === 4,
    `${list.querySelectorAll('.gb-entry').length}`);
  check('guestbook total reads (4)', text('#gb-total') === '(4)');
  check('newest entry sorts first', list.querySelector('.gb-name').textContent === 'smoke_tester',
    list.querySelector('.gb-name').textContent);
  check('messages are HTML-escaped',
    list.querySelector('.gb-msg').innerHTML.includes('&lt;script&gt;') &&
    !list.querySelector('.gb-msg').querySelector('script'),
    list.querySelector('.gb-msg').innerHTML);
  check('entry persisted to localStorage',
    JSON.parse(window.localStorage.getItem('neapolitan.guestbook')).length === 4);
  check('handle remembered for next time',
    JSON.parse(window.localStorage.getItem('neapolitan.guestbook.name')) === 'smoke_tester');
  check('timestamp reads as "just now"', list.querySelector('.gb-time').textContent === 'just now',
    list.querySelector('.gb-time').textContent);
  check('message box cleared, handle kept', msgInput.value === '' && nameInput.value === 'smoke_tester');

  msgInput.value = 'abc';
  msgInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  check('character counter tracks typing', text('#gb-counter') === '3 / 280', text('#gb-counter'));
});

/* --- visit counter ------------------------------------------------------- */
section('#hits', () => {
  const hits = document.querySelector('#hits');
  check('visit counter renders 6 digits', hits.querySelectorAll('i').length === 6);
  check('first visit reads 000001', hits.textContent.trim() === '000001', hits.textContent);
  check('visits are stored', window.localStorage.getItem('neapolitan.hits') === '1',
    window.localStorage.getItem('neapolitan.hits'));
});

/* --- confetti ------------------------------------------------------------ */
section('.logo', () => {
  click(document.querySelector('.logo'));
  check('clicking the station name throws confetti', document.querySelectorAll('body > i').length > 0,
    `${document.querySelectorAll('body > i').length} pieces`);
});

/* --- no errors ----------------------------------------------------------- */
check('no uncaught errors', errors.length === 0, errors.join(' | '));

/* --- report -------------------------------------------------------------- */
console.log(`\n${page}: ${pass.length} passed, ${fail.length} failed` +
  (skipped.length ? `, ${skipped.length} widget group(s) not on this page` : '') + '\n');
pass.forEach((p) => console.log(`  PASS  ${p}`));
if (fail.length) {
  console.log('');
  fail.forEach((f) => console.log(`  FAIL  ${f}`));
}
process.exit(fail.length ? 1 : 0);
