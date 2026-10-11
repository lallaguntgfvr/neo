/* ==========================================================================
   NEAPOLITAN STATION — script.js
   --------------------------------------------------------------------------
   One plain <script>, no dependencies, no build step, no network calls.
   Everything is progressive: turn JavaScript off and the page still reads,
   the widgets just keep their starting values.

   Contents:
      1. helpers               2. station clock + mini calendar
      3. live transmission     4. status + meters
      5. currently-playing     6. colour palette
      7. to-do list            8. cat of the day
      9. guestbook            10. visit counter
     11. confetti
   ========================================================================== */

/* 1. HELPERS -------------------------------------------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* localStorage throws in private modes and some sandboxed frames */
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
  stationClock();
  miniCalendar();
  transmission();
  statusWidget();
  player();
  palette();
  todoList();
  catOfTheDay();
  guestbook();
  visitCounter();
  confetti();
});

/* 2. STATION CLOCK + MINI CALENDAR --------------------------------------- */
function stationClock() {
  const time = $('#clock');
  const date = $('#clock-date');
  if (!time) return;

  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const tick = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    let hours = now.getHours();
    const suffix = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    time.textContent = `${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${suffix}`;
    if (date) {
      date.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
  };

  tick();
  window.setInterval(tick, 1000);
}

function miniCalendar() {
  const head = $('#cal-month');
  const body = $('#cal-body');
  if (!body) return;

  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (head) head.textContent = `${MONTHS[month]} ${year}`;

  body.innerHTML = '';
  let row = document.createElement('tr');

  for (let i = 0; i < firstWeekday; i += 1) {
    const cell = document.createElement('td');
    cell.className = 'is-blank';
    cell.textContent = '·';
    row.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    if (row.children.length === 7) {
      body.appendChild(row);
      row = document.createElement('tr');
    }
    const cell = document.createElement('td');
    cell.textContent = String(day);
    if (day === today) {
      cell.className = 'is-today';
      cell.setAttribute('aria-current', 'date');
    }
    row.appendChild(cell);
  }

  while (row.children.length < 7) {
    const cell = document.createElement('td');
    cell.className = 'is-blank';
    cell.textContent = '·';
    row.appendChild(cell);
  }
  body.appendChild(row);
}

/* 3. LIVE TRANSMISSION --------------------------------------------------- */
const TRANSMISSIONS = [
  'baking something pink, back in a minute…',
  'currently rendering: one (1) hyperlink',
  'the wallpaper took longer than the whole page',
  'someone signed the guestbook today. this is the news.',
  'thinking about adding a webring page. always.',
  'listening to the kettle instead of music',
  'spot the cat in the gallery. she is asleep.',
  'no cookies were set in the making of this website',
  'rewriting the same paragraph for the fourth time',
  'the buttons page is my favourite part. go look.'
];

function transmission() {
  const text = $('#transmission');
  const btn = $('#tx-btn');
  if (!text) return;

  let index = 0;
  const show = (i) => {
    text.textContent = TRANSMISSIONS[i];
    text.classList.remove('is-new');
    void text.offsetWidth;
    text.classList.add('is-new');
  };

  show(index);
  if (btn) {
    btn.addEventListener('click', () => {
      index = (index + 1) % TRANSMISSIONS.length;
      show(index);
    });
  }
}

/* 4. STATUS + METERS ----------------------------------------------------- */
const MOODS = [
  'drinking the fourth coffee and redrawing a cat',
  'mood: warm, slightly crumpled, very online',
  'rearranging the same six colours again',
  'wondering who invented the marquee and whether they are okay',
  'status: writing html like it is 2003, on purpose',
  'feeling: a small website, built anyway',
  'watching the visit counter like it is the stock market',
  'currently: yes, this is the whole hobby',
  'planning a page about teapots, obviously'
];

function statusWidget() {
  const bubble = $('#status-bubble');
  const btn = $('#status-btn');
  const meters = $$('.meter i');
  const label = $('.status-text');
  if (!bubble) return;

  let index = Math.floor(Math.random() * MOODS.length);

  const show = (i) => {
    bubble.textContent = MOODS[i];
    bubble.classList.remove('is-new');
    void bubble.offsetWidth;
    bubble.classList.add('is-new');
  };

  const rerollMeters = () => {
    if (rerollMeters.disabled) return;
    meters.forEach((bar) => {
      const value = 30 + Math.floor(Math.random() * 70);
      bar.style.width = `${value}%`;
      bar.closest('.meter')?.setAttribute('aria-label', `${Math.round(value / 20)} out of 5`);
    });
  };

  show(index);

  if (btn) {
    btn.addEventListener('click', () => {
      index = (index + 1) % MOODS.length;
      show(index);
      rerollMeters();
    });
  }

  if (label) {
    window.setInterval(() => {
      if (!document.hidden) {
        index = (index + 1) % MOODS.length;
        show(index);
      }
    }, 9000);
  }
}

/* 5. CURRENTLY PLAYING --------------------------------------------------- */
const PLAYLIST = [
  ['01. shortwave lullaby', 'the kettle choir'],
  ['02. plaid blanket waltz', 'modem & the biscuits'],
  ['03. strawberry static', 'cassette ghost'],
  ['04. waiting for the cake to rise', 'the slow ovens'],
  ['05. page under construction', 'dial tone dream'],
  ['06. two cats on one keyboard', 'the interrupters'],
  ['07. tea at three in the morning', 'insomnia fm'],
  ['08. goodbye, guestbook stranger', 'the nice strangers']
];

function player() {
  const title = $('#track-title');
  const playBtn = $('#play-btn');
  const nextBtn = $('#shuffle-btn');
  if (!title) return;

  let index = 0;
  const render = () => {
    const [name, artist] = PLAYLIST[index];
    title.textContent = `${name} — ${artist}`;
  };

  render();

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const playing = document.body.classList.toggle('is-playing');
      playBtn.setAttribute('aria-pressed', String(playing));
      playBtn.lastChild.textContent = playing ? 'PAUSE' : 'PLAY';
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let next = index;
      while (next === index && PLAYLIST.length > 1) {
        next = Math.floor(Math.random() * PLAYLIST.length);
      }
      index = next;
      render();
    });
  }
}

/* 6. COLOUR PALETTE ------------------------------------------------------ */
function palette() {
  const list = $('#palette');
  const name = $('#palette-name');
  if (!list || !name) return;

  const defaultText = name.textContent;

  $$('li', list).forEach((swatch) => {
    swatch.setAttribute('tabindex', '0');
    swatch.setAttribute('role', 'button');
    const value = swatch.dataset.hex || '';
    const label = swatch.dataset.name || 'colour';
    swatch.setAttribute('aria-label', `${label} ${value} — copy the hex code`);

    const describe = () => {
      name.textContent = value ? `${label} · ${value}` : label;
    };
    const reset = () => { name.textContent = defaultText; };

    const copy = () => {
      if (!value || !navigator.clipboard) {
        name.textContent = value ? `${label} · ${value}` : label;
        return;
      }
      navigator.clipboard.writeText(value).then(
        () => { name.textContent = `copied ${value} — paste it somewhere nice`; },
        () => { /* clipboard refused; the hex stays on screen anyway */ }
      );
    };

    swatch.addEventListener('mouseenter', describe);
    swatch.addEventListener('focus', describe);
    swatch.addEventListener('mouseleave', reset);
    swatch.addEventListener('blur', reset);
    swatch.addEventListener('click', copy);
    swatch.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copy();
      }
    });
  });
}

/* 7. TO-DO LIST ---------------------------------------------------------- */
function todoList() {
  const items = $$('.checklist li');
  if (!items.length) return;

  items.forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'checkbox');

    const img = $('img', item);
    const text = item.textContent.trim().replace(/\s+/g, ' ');
    let done = img ? /done/i.test(img.alt) : false;

    const sync = () => {
      item.setAttribute('aria-checked', String(done));
      if (img) {
        img.src = done ? 'assets/icons/check.png' : 'assets/icons/pin.png';
        img.alt = done ? 'done' : 'todo';
      }
    };

    const toggle = () => {
      const label = item.lastChild;
      if (!label) return;
      const replacement = document.createElement(done ? 'span' : 's');
      replacement.textContent = label.textContent;
      item.replaceChild(replacement, label);
      done = !done;
      sync();
    };

    // ignore clicks on links inside an item (the 404 page has them) so
    // following a link doesn't also tick the item off
    item.addEventListener('click', (event) => {
      if (event.target instanceof window.Element && event.target.closest('a')) return;
      toggle();
    });
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
    item.setAttribute('aria-label', `${text} — tick off`);
    sync();
  });
}

/* 8. CAT OF THE DAY ------------------------------------------------------ */
const CAT_LINES = [
  'the cat is asleep. leave a message.',
  'she has moved 4cm in three hours. impressive.',
  'the cat is on the keyboard. the page can wait.',
  'she says hi, then bites the cursor.',
  'the cat has claimed the blanket. it is hers now.',
  'the cat watched me build this entire page. no feedback.'
];

function catOfTheDay() {
  const note = $('#cat-note');
  const btn = $('#cat-btn');
  if (!note) return;

  let index = 0;
  if (btn) {
    btn.addEventListener('click', () => {
      index = (index + 1) % CAT_LINES.length;
      note.textContent = CAT_LINES[index];
      btn.lastChild.textContent = index === 0 ? 'WAKE HER' : 'AGAIN';
    });
  }
}

/* 9. GUESTBOOK (localStorage) ------------------------------------------- */
const GB_KEY = 'neapolitan.guestbook';
const NAME_KEY = 'neapolitan.guestbook.name';
const MAX_LEN = 280;

const SEED_ENTRIES = [
  {
    name: 'cakecrumb',
    msg: 'found you through a webring at 1am. the plaid wallpaper is doing a lot and i respect it.',
    ts: Date.now() - 1000 * 60 * 60 * 27
  },
  {
    name: 'sleepycat',
    msg: 'the cat photo made me put my tea down and stare out the window for ten minutes. ten out of ten.',
    ts: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    name: 'warm_signal',
    msg: 'do you take recipe requests? asking for a friend who is me.',
    ts: Date.now() - 1000 * 60 * 52
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
      setStatus('Both boxes, please — I want to know who to thank.', true);
      (!name ? nameInput : msgInput)?.focus();
      return;
    }

    entries.push({ name: name.slice(0, 24), msg: msg.slice(0, MAX_LEN), ts: Date.now() });

    if (store.set(GB_KEY, entries)) {
      store.set(NAME_KEY, name.slice(0, 24));
      setStatus(`Signed. Thank you, ${name.slice(0, 24)} — your note is saved in this browser.`);
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

/* 10. VISIT COUNTER ------------------------------------------------------ */
/* Honest disclosure: a static host has no server to count visits for you, so
   this counts visits in your own browser. That is the joke and the charm of a
   Nineties hit counter, so it is labelled as such on the page. */
function visitCounter() {
  const el = $('#hits');
  if (!el) return;

  const visits = Number(store.get('neapolitan.hits', 0)) + 1;
  store.set('neapolitan.hits', visits);

  const digits = String(Math.min(visits, 999999)).padStart(6, '0').split('');
  el.innerHTML = digits.map((d) => `<i>${d}</i>`).join('');
  el.setAttribute('aria-label', `${visits} visit${visits === 1 ? '' : 's'} recorded in this browser`);
}

/* 11. SCROLL REVEAL ------------------------------------------------------ */
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
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

  targets.forEach((el) => observer.observe(el));
}

/* 12. CONFETTI ----------------------------------------------------------- */
/* Click the station name for a shower of little pink squares. */
function confetti() {
  const trigger = $('.logo');
  if (!trigger) return;

  trigger.style.cursor = 'pointer';
  trigger.title = 'click me';

  trigger.addEventListener('click', () => {
    const rect = trigger.getBoundingClientRect();
    const colours = ['#e2aab2', '#c886a0', '#6c4028', '#f2cfd4', '#f7e9d7'];

    for (let i = 0; i < 24; i += 1) {
      const bit = document.createElement('i');
      bit.setAttribute('aria-hidden', 'true');
      const size = 5 + Math.random() * 7;
      bit.style.cssText = `position:fixed;z-index:9999;pointer-events:none;
        width:${size}px;height:${size}px;
        left:${rect.left + Math.random() * rect.width}px;
        top:${rect.top + rect.height / 2}px;
        background:${colours[i % colours.length]};
        border:1px solid #351e10;`;
      document.body.appendChild(bit);

      if (typeof bit.animate === 'function') {
        bit.animate(
          [
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            {
              transform: `translate(${(Math.random() - 0.5) * 240}px, ${70 + Math.random() * 170}px) rotate(${Math.random() * 480 - 240}deg)`,
              opacity: 0
            }
          ],
          { duration: 900 + Math.random() * 600, easing: 'steps(8, end)' }
        ).onfinish = () => bit.remove();
      } else {
        window.setTimeout(() => bit.remove(), 1200);
      }
    }
  });
}
