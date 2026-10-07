/* Quán Nam: small progressive enhancements. The page works without any of this. */
(() => {
  'use strict';

  /* ---------- Settings you may want to edit ---------- */
  // Rough đồng per unit of each currency. Update every few months.
  const RATES = { USD: 26000, EUR: 30000 };
  const SAIGON_TZ = 'Asia/Ho_Chi_Minh';

  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } },
  };

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector('.navtoggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close sections menu' : 'Open sections menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Menu filters ---------- */
  const dishes = $$('.dish');
  const chips = $$('.chip');
  const count = document.getElementById('menu-count');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      let shown = 0;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      dishes.forEach((dish) => {
        const match = filter === 'all'
          || (filter === 'veg' ? dish.dataset.veg === 'true' : dish.dataset.cat === filter);
        dish.hidden = !match;
        if (match) shown += 1;
      });
      if (count) count.textContent = `Showing ${shown} ${shown === 1 ? 'dish' : 'dishes'}`;
    });
  });

  /* ---------- Currency toggle ---------- */
  const curButtons = $$('[data-cur]');
  const priced = $$('[data-vnd]');
  const money = {};
  const priceLabel = (vnd, cur) => {
    if (vnd === 0) return 'free';
    if (cur === 'VND' || !RATES[cur]) return `${vnd / 1000}k`;
    money[cur] ??= new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `≈ ${money[cur].format(vnd / RATES[cur])}`;
  };
  const setCurrency = (cur) => {
    curButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cur === cur)));
    priced.forEach((el) => { el.textContent = priceLabel(Number(el.dataset.vnd), cur); });
    store.set('quannam-currency', cur);
  };
  curButtons.forEach((b) => b.addEventListener('click', () => setCurrency(b.dataset.cur)));
  const savedCur = store.get('quannam-currency');
  if (savedCur && savedCur !== 'VND' && RATES[savedCur]) setCurrency(savedCur);

  /* ---------- Open / closed, in Saigon time ---------- */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const fmtTime = (mins) => {
    const h24 = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const h = h24 % 12 || 12;
    const ap = h24 < 12 ? 'am' : 'pm';
    return m ? `${h}:${String(m).padStart(2, '0')} ${ap}` : `${h} ${ap}`;
  };

  const hourRows = $$('.hours tr[data-days]');
  const schedule = Array(7).fill(null);
  hourRows.forEach((row) => {
    row.dataset.days.split(/\s+/).map(Number).forEach((d) => {
      schedule[d] = { open: toMinutes(row.dataset.open), close: toMinutes(row.dataset.close) };
    });
  });

  const saigonNow = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: SAIGON_TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
      minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
    };
  };

  const openState = ({ day, minutes }) => {
    const today = schedule[day];
    if (today && minutes >= today.open && minutes < today.close) {
      return { open: true, text: `Open now · kitchen closes ${fmtTime(today.close)}` };
    }
    for (let i = 0; i < 7; i += 1) {
      const d = (day + i) % 7;
      const s = schedule[d];
      if (!s) continue;
      if (i === 0 && minutes < s.open) return { open: false, text: `Closed now · opens ${fmtTime(s.open)} today` };
      if (i === 1) return { open: false, text: `Closed now · opens ${fmtTime(s.open)} tomorrow` };
      if (i > 1) return { open: false, text: `Closed now · opens ${DAY_NAMES[d]} ${fmtTime(s.open)}` };
    }
    return { open: false, text: 'Closed for now' };
  };

  const statusEls = $$('[data-status]');
  const updateStatus = () => {
    if (!hourRows.length) return;
    let now;
    try { now = saigonNow(); } catch { return; }
    if (now.day < 0) return;
    const state = openState(now);
    const clock = `It's ${fmtTime(now.minutes)} in Saigon`;
    statusEls.forEach((el, i) => {
      el.classList.toggle('is-open', state.open);
      el.classList.toggle('is-closed', !state.open);
      const text = el.querySelector('.status__text');
      // The hero pill stays short; the Find us pill also shows the local clock.
      if (text) text.textContent = i === 0 ? state.text : `${state.text} · ${clock}`;
    });
    hourRows.forEach((row) => {
      row.classList.toggle('is-today', row.dataset.days.split(/\s+/).map(Number).includes(now.day));
    });
  };
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Copy the address for a Grab driver ---------- */
  $$('[data-copy]').forEach((btn) => {
    const original = btn.textContent;
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copy);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        btn.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'Selected. Copy it now';
      }
      setTimeout(() => { btn.textContent = original; }, 2500);
    });
  });

  /* ---------- Hear the phrases (only if the device has a Vietnamese voice) ---------- */
  if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
    const synth = window.speechSynthesis;
    const sayButtons = $$('.say');
    let voice = null;
    const pickVoice = () => {
      voice = synth.getVoices().find((v) => /^vi([-_]|$)/i.test(v.lang)) || null;
      sayButtons.forEach((b) => { b.hidden = !voice; });
    };
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
    sayButtons.forEach((b) => {
      b.setAttribute('aria-label', `Hear “${b.dataset.say}” spoken`);
      b.addEventListener('click', () => {
        if (!voice) return;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(b.dataset.say);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.8;
        synth.speak(u);
      });
    });
  }

  /* ---------- Phone quick bar: same links as Find us, hidden while the hero is on screen ---------- */
  const quickbar = document.querySelector('.quickbar');
  if (quickbar) {
    $$('[data-link-from]', quickbar).forEach((a) => {
      const source = document.querySelector(`[data-link="${a.dataset.linkFrom}"]`);
      if (source) a.href = source.href;
    });
    const hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        quickbar.classList.toggle('is-shown', entry.intersectionRatio < 0.35);
      }, { threshold: [0, 0.35, 1] }).observe(hero);
    } else {
      quickbar.classList.add('is-shown');
    }
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
