/* Bontà: small progressive enhancements. The page works without any of this. */
(() => {
  'use strict';

  /* ---------- Language: English is written in the page, Vietnamese comes from js/i18n-vi.js ---------- */
  const VI = window.BONTA_VI || {};
  const EN = { 'js.openNow': 'Open now', 'js.closedNow': 'Closed now' };
  const root = document.documentElement;
  let lang = 'en';
  const onLangChange = [];
  const t = (key) => (lang === 'vi' && VI[key]) || EN[key] || key;

  // Remember the English written in the page, so switching back restores it exactly.
  const ATTRS = { i18nAlt: 'alt', i18nCaption: 'data-caption', i18nAria: 'aria-label' };
  const textEls = [...document.querySelectorAll('[data-i18n]')];
  const attrEls = [...document.querySelectorAll('[data-i18n-alt], [data-i18n-caption], [data-i18n-aria]')];
  const english = new Map();
  textEls.forEach((el) => english.set(el, { html: el.innerHTML }));
  attrEls.forEach((el) => {
    const saved = english.get(el) || {};
    Object.entries(ATTRS).forEach(([data, attr]) => { if (el.dataset[data]) saved[attr] = el.getAttribute(attr); });
    english.set(el, saved);
  });

  const langButtons = [...document.querySelectorAll('button[data-lang]')];
  const setLang = (next, remember) => {
    lang = next === 'vi' && Object.keys(VI).length ? 'vi' : 'en';
    root.lang = lang;
    root.dataset.lang = lang;
    textEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === 'vi' && VI[key] != null ? VI[key] : english.get(el).html;
    });
    attrEls.forEach((el) => {
      Object.entries(ATTRS).forEach(([data, attr]) => {
        const key = el.dataset[data];
        if (key) el.setAttribute(attr, lang === 'vi' && VI[key] != null ? VI[key] : english.get(el)[attr]);
      });
    });
    langButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    onLangChange.forEach((fn) => fn());
    if (!remember) return;
    try { localStorage.setItem('bonta-lang', lang); } catch { /* storage blocked */ }
    // Put the language in the address, so a shared link opens in the same language.
    try {
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    } catch { /* not allowed here */ }
  };
  langButtons.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang, true)));

  /* ---------- Tap a photo to see it big ----------
     Each photo is a link to the full-size image, so without this it still opens. */
  const box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    const img = box.querySelector('.lightbox__img');
    const caption = box.querySelector('.lightbox__caption');
    document.querySelectorAll('a.zoom').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const thumb = link.querySelector('img');
        img.src = link.href;
        img.alt = thumb ? thumb.alt : '';
        caption.textContent = link.dataset.caption || '';
        box.showModal();
      });
    });
    box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
    // Clicking the dark backdrop (outside the photo card) closes it too.
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('close', () => { img.src = 'data:,'; });
  }

  /* ---------- Open now? (Vietnam time) ----------
     Reads the hours from data-open / data-close on the opening-hours line in index.html. */
  const hoursEl = document.querySelector('[data-open][data-close]');
  const toMinutes = (hhmm) => {
    const [h, m] = String(hhmm).split(':').map(Number);
    return Number.isInteger(h) && Number.isInteger(m) ? h * 60 + m : NaN;
  };
  const OPEN_FROM = hoursEl ? toMinutes(hoursEl.dataset.open) : NaN;
  const OPEN_UNTIL = hoursEl ? toMinutes(hoursEl.dataset.close) : NaN;
  const statusEls = [...document.querySelectorAll('[data-open-status]')];
  if (statusEls.length && !Number.isNaN(OPEN_FROM) && !Number.isNaN(OPEN_UNTIL)) {
    const update = () => {
      let parts;
      try {
        parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      } catch { return; }
      const get = (type) => Number(parts.find((p) => p.type === type)?.value);
      const now = (get('hour') % 24) * 60 + get('minute');
      if (Number.isNaN(now)) return;
      const open = now >= OPEN_FROM && now < OPEN_UNTIL;
      statusEls.forEach((el) => {
        el.textContent = t(open ? 'js.openNow' : 'js.closedNow');
        el.classList.toggle('is-open', open);
        el.hidden = false;
      });
    };
    update();
    setInterval(update, 60 * 1000);
    onLangChange.push(update);
  }

  /* ---------- Apply the language chosen in <head>, then show the page ---------- */
  setLang(root.dataset.lang, false);
  root.classList.remove('i18n-wait');

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
