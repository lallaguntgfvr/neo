/* ---------------------------------------------------------------------------
   NOVA STATION — headless smoke test
   ---------------------------------------------------------------------------
   Runs index.html in jsdom and exercises every interactive feature, so changes
   to script.js can be checked without opening a browser.

   Run:
     npm install --no-save jsdom
     node .tools/smoke-test.mjs
   (The test file is not uploaded to Neocities — see README.)
   --------------------------------------------------------------------------- */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.error('jsdom is not installed. Run:  npm install --no-save jsdom');
  process.exit(2);
}

// NOTE: the replacer must be a function — script.js is full of `$('...')`
// selectors, and `$'` in a replacement string means "the rest of the document".
const inlineScript = readFileSync(join(root, 'script.js'), 'utf8');
const html = readFileSync(join(root, 'index.html'), 'utf8')
  .replace('<script src="script.js"></script>', () => `<script>${inlineScript}</script>`);

const errors = [];
const dom = new JSDOM(html, {
  url: 'https://nova-station.neocities.org/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: new (await import('jsdom')).VirtualConsole().on('jsdomError', (e) => errors.push(e.message))
});

const { window } = dom;
const { document } = window;

const pass = [];
const fail = [];
const check = (label, condition, detail = '') => {
  (condition ? pass : fail).push(label + (detail && !condition ? `  (${detail})` : ''));
};

await new Promise((r) => window.addEventListener('load', r));

/* --- 1. clock ------------------------------------------------------------ */
check('clock shows a time', /\d{1,2}:\d{2}:\d{2} (AM|PM)/.test(document.querySelector('#clock').textContent),
  document.querySelector('#clock').textContent);

/* --- 2. copyright year --------------------------------------------------- */
check('footer year is set', /^20\d\d$/.test(document.querySelector('#year').textContent),
  document.querySelector('#year').textContent);

/* --- 3. CRT toggle ------------------------------------------------------- */
const crtBtn = document.querySelector('#crt-toggle');
const crtBefore = document.body.classList.contains('crt-off');
crtBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('CRT toggle flips the body class', document.body.classList.contains('crt-off') !== crtBefore);
check('CRT button label updates', /CRT: (ON|OFF)/.test(crtBtn.textContent), crtBtn.textContent);
check('CRT toggle persists', window.localStorage.getItem('nova.crt') !== null);

/* --- 4. status bubble ---------------------------------------------------- */
const bubble = document.querySelector('#status-bubble');
const firstMood = bubble.textContent;
document.querySelector('#status-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('poking status.exe changes the mood', bubble.textContent !== firstMood,
  `${firstMood} -> ${bubble.textContent}`);
check('poke counter reads "1 poke"', document.querySelector('#status-count').textContent === '1 poke',
  document.querySelector('#status-count').textContent);

/* --- 5. music player ----------------------------------------------------- */
const playBtn = document.querySelector('#play-btn');
playBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('play toggles is-playing', document.body.classList.contains('is-playing'));
check('play button label reads Pause', playBtn.textContent === 'Pause', playBtn.textContent);
playBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('pause clears is-playing', !document.body.classList.contains('is-playing'));

const title = document.querySelector('#track-title').textContent;
let shuffled = false;
for (let i = 0; i < 20 && !shuffled; i += 1) {
  document.querySelector('#shuffle-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  shuffled = document.querySelector('#track-title').textContent !== title;
}
check('next track changes the song', shuffled, document.querySelector('#track-title').textContent);

/* --- 6. guestbook -------------------------------------------------------- */
const list = document.querySelector('#gb-list');
check('guestbook seeds 3 entries', list.querySelectorAll('.gb-entry').length === 3,
  `${list.querySelectorAll('.gb-entry').length} entries`);
check('guestbook total shows (3)', document.querySelector('#gb-total').textContent === '(3)',
  document.querySelector('#gb-total').textContent);

const form = document.querySelector('#gb-form');
const nameInput = document.querySelector('#gb-name');
const msgInput = document.querySelector('#gb-msg');

// reject empty submissions
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check('empty submit is refused', /Both fields/.test(document.querySelector('#gb-status').textContent),
  document.querySelector('#gb-status').textContent);

// reject a name with no message
nameInput.value = 'tester';
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check('name-only submit is refused', /Both fields/.test(document.querySelector('#gb-status').textContent));

// accept a real one
nameInput.value = '  smoke_tester  ';
msgInput.value = '  hello from the test harness <script>alert(1)</script>  ';
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check('valid submit adds an entry', list.querySelectorAll('.gb-entry').length === 4,
  `${list.querySelectorAll('.gb-entry').length}`);
check('guestbook total shows (4)', document.querySelector('#gb-total').textContent === '(4)');
check('new entry is rendered first', list.querySelector('.gb-name').textContent === 'smoke_tester',
  list.querySelector('.gb-name').textContent);
check('messages are HTML-escaped',
  list.querySelector('.gb-msg').innerHTML.includes('&lt;script&gt;') &&
  !list.querySelector('.gb-msg').querySelector('script'),
  list.querySelector('.gb-msg').innerHTML);
check('entry persisted to localStorage',
  JSON.parse(window.localStorage.getItem('nova.guestbook')).length === 4);
check('name remembered for next time',
  JSON.parse(window.localStorage.getItem('nova.guestbook.name')) === 'smoke_tester',
  window.localStorage.getItem('nova.guestbook.name'));
check('timestamp renders as "just now"', list.querySelector('.gb-time').textContent === 'just now',
  list.querySelector('.gb-time').textContent);
check('form is cleared after signing', nameInput.value === 'smoke_tester' && msgInput.value === '');

// character counter
msgInput.value = 'abc';
msgInput.dispatchEvent(new window.Event('input', { bubbles: true }));
check('character counter tracks typing', document.querySelector('#gb-counter').textContent === '3 / 280',
  document.querySelector('#gb-counter').textContent);

/* --- 7. hit counter ------------------------------------------------------ */
const hits = document.querySelector('#hits');
check('hit counter renders 7 digits', hits.querySelectorAll('i').length === 7);
check('hit counter is at 0000001 on a first visit', hits.textContent.trim() === '0000001', hits.textContent);
check('hit counter stores visits', window.localStorage.getItem('nova.hits') === '1',
  window.localStorage.getItem('nova.hits'));

/* --- 8. scroll reveals (no IntersectionObserver -> visible fallback) ----- */
const reveals = [...document.querySelectorAll('.reveal')];
check('every reveal section falls back to visible',
  reveals.every((el) => el.classList.contains('in')),
  `${reveals.filter((el) => el.classList.contains('in')).length}/${reveals.length}`);

/* --- 9. easter eggs ------------------------------------------------------ */
document.querySelector('.hero-avatar').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('avatar click adds confetti pixels', document.querySelectorAll('body > i').length > 0,
  `${document.querySelectorAll('body > i').length} pixels`);

const KEYS = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
KEYS.forEach((key) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true })));
check('konami code turns on party mode', document.body.classList.contains('party'));
check('party mode announces itself', /PARTY MODE/.test(bubble.textContent), bubble.textContent);
KEYS.forEach((key) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true })));
check('konami code turns party mode back off', !document.body.classList.contains('party'));

/* --- 10. no runtime errors ---------------------------------------------- */
check('no uncaught errors', errors.length === 0, errors.join(' | '));

/* --- report -------------------------------------------------------------- */
console.log(`\n${pass.length} passed, ${fail.length} failed\n`);
pass.forEach((p) => console.log(`  PASS  ${p}`));
if (fail.length) {
  console.log('');
  fail.forEach((f) => console.log(`  FAIL  ${f}`));
}
process.exit(fail.length ? 1 : 0);
