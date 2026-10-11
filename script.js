/* ==========================================================================
   NOVA STATION — script.js
   --------------------------------------------------------------------------
   One plain <script>, no dependencies, no build step, no network calls.
   Everything here is progressive: switch JS off and the page still reads fine.

   Contents:
     1. tiny helpers                        2. clock + copyright year
     3. CRT scanline toggle                 4. status.exe bubble
     5. fake music player                   6. guestbook (localStorage)
     7. hit counter                         8. scroll reveal
     9. sticky-nav highlighting            10. easter eggs
   ========================================================================== */

/* 1. HELPERS -------------------------------------------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* localStorage can throw in private modes / sandboxed iframes — wrap it */
const store = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  clock();
  copyrightYear();
  crtToggle();
  statusBubble();
  musicPlayer();
  guestbook();
  hitCounter();
  scrollReveal();
  activeNav();
  easterEggs();
});

/* 2. CLOCK + COPYRIGHT YEAR ----------------------------------------------- */
function clock() {
  const el = $('#clock');
  if (!el) return;

  const tick = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    let hours = now.getHours();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    el.textContent = `${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${suffix}`;
  };

  tick();
  window.setInterval(tick, 1000);
}

function copyrightYear() {
  const el = $('#year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* 3. CRT SCANLINE TOGGLE -------------------------------------------------- */
function crtToggle() {
  const btn = $('#crt-toggle');
  if (!btn) return;

  const apply = (on) => {
    document.body.classList.toggle('crt-off', !on);
    btn.textContent = on ? 'CRT: ON' : 'CRT: OFF';
    btn.setAttribute('aria-pressed', String(on));
    store.set('nova.crt', on);          // remembered for the next visit
  };

  apply(store.get('nova.crt', true) !== false);

  btn.addEventListener('click', () => apply(document.body.classList.contains('crt-off')));
}

/* 4. STATUS.EXE BUBBLE ---------------------------------------------------- */
const MOODS = [
  'currently: drinking cold coffee and redrawing a cat',
  'mood: 56k modem noise, but happy',
  'listening to the fan on my old tower spin up',
  'thinking about how good the GeoCities archive is',
  'status: writing HTML like it is 1999 and that is fine',
  'feeling: a website nobody asked for, made anyway',
  'watching the hit counter like it is a stock ticker',
  'currently: yes, this is the whole hobby',
  'mood: neon-coloured and slightly off-centre',
  'thinking about adding a webring. always.',
  'status: pixels placed with zero professional training'
];

function statusBubble() {
  const bubble = $('#status-bubble');
  const btn = $('#status-btn');
  const countEl = $('#status-count');
  if (!bubble) return;

  let moodIndex = Math.floor(Math.random() * MOODS.length);
  let pokes = store.get('nova.pokes', 0);

  const show = (text) => {
    bubble.textContent = text;
    bubble.classList.remove('is-new');
    void bubble.offsetWidth;      // restart the pop animation
    bubble.classList.add('is-new');
  };

  const render = () => {
    bubble.textContent = MOODS[moodIndex];
    if (countEl) countEl.textContent = `${pokes} poke${pokes === 1 ? '' : 's'}`;
  };

  render();

  if (btn) {
    btn.addEventListener('click', () => {
      moodIndex = (moodIndex + 1) % MOODS.length;
      pokes += 1;
      store.set('nova.pokes', pokes);
      show(MOODS[moodIndex]);
      if (countEl) countEl.textContent = `${pokes} poke${pokes === 1 ? '' : 's'}`;
    });
  }

  // drift on its own too, but never while the tab is hidden
  window.setInterval(() => {
    if (!document.hidden) {
      moodIndex = (moodIndex + 1) % MOODS.length;
      show(MOODS[moodIndex]);
    }
  }, 7000);
}

/* 5. FAKE MUSIC PLAYER ---------------------------------------------------- */
const PLAYLIST = [
  '01. dial-up dreams (midnight modem mix)',
  '02. scanlines over the parking lot',
  '03. floppy disk heartbeat',
  '04. waiting for the page to load (extended cut)',
  '05. neon on wet asphalt',
  '06. the CD spins forever',
  '07. goodbye, guestbook stranger',
  '08. reboot me at 3am'
];

function musicPlayer() {
  const playBtn = $('#play-btn');
  const shuffleBtn = $('#shuffle-btn');
  const titleEl = $('#track-title');
  const artistEl = $('.player-artist');
  if (!playBtn || !titleEl) return;

  const ARTISTS = ['THE DEAD PIXELS', 'SYSOP & THE CARRIER TONES', 'ISDN DREAMS', 'MODEM CHOIR'];
  let index = 0;

  const renderTrack = () => {
    titleEl.textContent = PLAYLIST[index];
    if (artistEl) artistEl.textContent = `${ARTISTS[index % ARTISTS.length]} · 1998`;
  };

  renderTrack();

  playBtn.addEventListener('click', () => {
    const playing = document.body.classList.toggle('is-playing');
    playBtn.textContent = playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(playing));
  });

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      let next = index;
      while (next === index && PLAYLIST.length > 1) {
        next = Math.floor(Math.random() * PLAYLIST.length);
      }
      index = next;
      renderTrack();
    });
  }
}

/* 6. GUESTBOOK (localStorage) -------------------------------------------- */
const GB_KEY = 'nova.guestbook';
const NAME_KEY = 'nova.guestbook.name';
const MAX_LEN = 280;

const SEED_ENTRIES = [
  {
    name: 'pixelwitch',
    msg: 'found this through a webring at 1am. the floppy disk piece is going straight in my bookmarks folder.',
    ts: Date.now() - 1000 * 60 * 60 * 26
  },
  {
    name: 'socket_error',
    msg: 'your marquee scrolls at exactly the right speed, which is a science nobody respects. signed.',
    ts: Date.now() - 1000 * 60 * 60 * 5
  },
  {
    name: 'dial_up_dad',
    msg: 'came for the hit counter, stayed for the cat astronaut. tell me when the webring opens.',
    ts: Date.now() - 1000 * 60 * 47
  }
];

function guestbook() {
  const form = $('#gb-form');
  const list = $('#gb-list');
  const nameInput = $('#gb-name');
  const msgInput = $('#gb-msg');
  const status = $('#gb-status');
  const counter = $('#gb-counter');
  const total = $('#gb-total');
  if (!form || !list) return;

  let entries = store.get(GB_KEY, null);
  if (!Array.isArray(entries)) {
    entries = SEED_ENTRIES.slice();
    store.set(GB_KEY, entries);
  }

  const escapeHTML = (str) =>
    String(str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

  const timeAgo = (ts) => {
    const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    const units = [
      ['year', 31536000], ['month', 2592000], ['week', 604800],
      ['day', 86400], ['hour', 3600], ['minute', 60]
    ];
    for (const [label, size] of units) {
      const value = Math.floor(seconds / size);
      if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  const render = () => {
    list.innerHTML = '';

    if (!entries.length) {
      const li = document.createElement('li');
      li.className = 'gb-empty';
      li.textContent = 'No signatures yet. Yours can be the first.';
      list.appendChild(li);
    }

    entries
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'gb-entry';
        li.innerHTML = `
          <span class="gb-avatar" aria-hidden="true">${escapeHTML((entry.name || '?').trim().charAt(0).toUpperCase() || '?')}</span>
          <div>
            <p class="gb-head">
              <span class="gb-name">${escapeHTML(entry.name)}</span>
              <span class="gb-time" title="${new Date(entry.ts).toLocaleString()}">${timeAgo(entry.ts)}</span>
            </p>
            <p class="gb-msg">${escapeHTML(entry.msg)}</p>
          </div>`;
        list.appendChild(li);
      });

    if (total) total.textContent = `(${entries.length})`;
  };

  const setStatus = (text, isError = false) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(isError));
  };

  // remember a returning visitor's handle
  const savedName = store.get(NAME_KEY, '');
  if (nameInput && savedName) nameInput.value = savedName;

  if (msgInput && counter) {
    const update = () => { counter.textContent = `${msgInput.value.length} / ${MAX_LEN}`; };
    msgInput.addEventListener('input', update);
    update();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = (nameInput?.value || '').trim();
    const msg = (msgInput?.value || '').trim();

    if (!name || !msg) {
      setStatus('Both fields, please — I want to know who to thank.', true);
      (!name ? nameInput : msgInput)?.focus();
      return;
    }

    entries.push({ name: name.slice(0, 24), msg: msg.slice(0, MAX_LEN), ts: Date.now() });

    if (store.set(GB_KEY, entries)) {
      store.set(NAME_KEY, name.slice(0, 24));
      setStatus(`Signed. Thanks, ${name.slice(0, 24)} — your note is saved in this browser.`);
    } else {
      setStatus('Your browser blocked storage, so the note was shown but not kept.', true);
    }

    form.reset();
    if (nameInput) nameInput.value = name.slice(0, 24);
    if (counter) counter.textContent = `0 / ${MAX_LEN}`;
    render();
  });

  render();
}

/* 7. HIT COUNTER ---------------------------------------------------------- */
/* Honest disclosure: this counts visits in *your* browser only, because a
   static host has no server to count them for you. That's the joke, and the
   whole charm, of a Nineties hit counter. */
function hitCounter() {
  const el = $('#hits');
  if (!el) return;

  const visits = Number(store.get('nova.hits', 0)) + 1;
  store.set('nova.hits', visits);

  const digits = String(visits).padStart(7, '0').split('');
  el.innerHTML = digits.map((d) => `<i>${d}</i>`).join('');
  el.setAttribute('aria-label', `${visits} visit${visits === 1 ? '' : 's'} recorded in this browser`);
}

/* 8. SCROLL REVEAL -------------------------------------------------------- */
function scrollReveal() {
  const targets = $$('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver((batch) => {
    batch.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  targets.forEach((el) => observer.observe(el));
}

/* 9. STICKY-NAV HIGHLIGHTING --------------------------------------------- */
function activeNav() {
  const links = $$('.nav-list a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));

  const observer = new IntersectionObserver((batch) => {
    batch.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = byId.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* 10. EASTER EGGS --------------------------------------------------------- */
function easterEggs() {
  const avatar = $('.hero-avatar');

  // click the cat: shower of pixels
  if (avatar) {
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', () => {
      const rect = avatar.getBoundingClientRect();
      const colours = ['#ff4fd8', '#53f2ff', '#ffe066', '#a678ff', '#7bffb2'];

      for (let i = 0; i < 26; i += 1) {
        const bit = document.createElement('i');
        bit.setAttribute('aria-hidden', 'true');
        const size = 4 + Math.random() * 6;
        bit.style.cssText = `position:fixed;z-index:9999;pointer-events:none;
          width:${size}px;height:${size}px;
          left:${rect.left + Math.random() * rect.width}px;
          top:${rect.top + rect.height / 2}px;
          background:${colours[i % colours.length]};`;
        document.body.appendChild(bit);

        // Web Animations API: every current browser has it, but don't leave
        // stray pixels behind if it is missing.
        if (typeof bit.animate === 'function') {
          bit.animate(
            [
              { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
              {
                transform: `translate(${(Math.random() - 0.5) * 260}px, ${80 + Math.random() * 190}px) rotate(${Math.random() * 540 - 270}deg)`,
                opacity: 0
              }
            ],
            { duration: 900 + Math.random() * 700, easing: 'steps(9, end)' }
          ).onfinish = () => bit.remove();
        } else {
          window.setTimeout(() => bit.remove(), 1200);
        }
      }
    });
  }

  // konami code (↑↑↓↓←→←→) turns the whole site into party mode
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  const bubble = $('#status-bubble');
  let progress = 0;

  document.addEventListener('keydown', (event) => {
    // event.target can be the document itself, which has no closest()
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea')) return;

    progress = event.key === CODE[progress] ? progress + 1 : (event.key === CODE[0] ? 1 : 0);

    if (progress === CODE.length) {
      progress = 0;
      const on = document.body.classList.toggle('party');
      if (bubble) {
        bubble.textContent = on
          ? 'PARTY MODE: ON — press ↑↑↓↓←→←→ again to switch it off'
          : 'party mode off. back to the usual neon hum.';
        bubble.classList.remove('is-new');
        void bubble.offsetWidth;
        bubble.classList.add('is-new');
      }
    }
  });
}
