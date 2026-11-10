/* Bontà: scroll transitions, and the loader for the 3D walk-in (js/journey.js).
   Everything here is decoration. Without it the page is the same page, standing still;
   visitors who ask their device for less motion get exactly that. */
(() => {
  'use strict';
  const root = document.documentElement;
  const self = document.currentScript;
  const topbar = document.querySelector('.topbar');
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero__stage');

  /* ---------- The 3D walk-in ----------
     <head> put "journey" on <html> if this browser can draw it. If the model fails to load,
     take the class away again and the ordinary top screen comes back. */
  let forced = false;
  try { forced = new URLSearchParams(location.search).get('3d') === '1'; } catch (e) { /* old browser */ }
  if (root.classList.contains('journey')) {
    // journey.js carries the same ?v= as this file, so a new release is never paired with a saved old copy
    const base = self && self.src ? new URL(self.src) : new URL('js/fx.js', document.baseURI);
    import(new URL('journey.js' + base.search, base).href).catch((err) => {
      root.classList.remove('journey', 'tour', 'tour-ready', 'past-stage');
      if (window.console) console.warn('Bontà: the 3D walk-in is off.', err);
      if (forced) {                       // asked for by name (?3d=1): say why, so it can be reported
        const note = document.createElement('p');
        note.className = 'tour__error';
        note.textContent = `The 3D walk-in could not start here: ${err && err.message ? err.message : err}`;
        document.body.appendChild(note);
      }
    });
  }
  // "See it in 3D", for visitors whose phone asks for less motion: reload this page with the walk-in switched on.
  document.querySelectorAll('.tour__optin').forEach((link) => link.addEventListener('click', (e) => {
    e.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set('3d', '1');
    url.hash = '';
    location.href = url.href;
  }));

  // The header is see-through while it sits over the night scene, and solid once the page has covered it.
  const setHeader = () => {
    if (!hero || !topbar || !root.classList.contains('journey')) return;
    const cover = hero.getBoundingClientRect().bottom - (root.classList.contains('tour') && stage ? stage.offsetHeight : 0);
    root.classList.toggle('past-stage', cover <= topbar.offsetHeight + 6);
  };

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });
    window.addEventListener('resize', setHeader);
    window.addEventListener('bonta:tour', setHeader);
    return;
  }
  root.classList.add('fx');

  /* ---------- Headlines rise word by word ----------
     Each word is wrapped so it can slide up from behind a mask. The language switch rewrites the
     headings, so they are wrapped again after every switch. */
  const headings = [...document.querySelectorAll('main h1, main h2')];
  const wrapWords = (el) => {
    if (el.children.length && !el.querySelector('.w')) return;        // leave headings with their own markup alone
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, i) => {
      const mask = document.createElement('span');
      const inner = document.createElement('span');
      mask.className = 'w';
      mask.setAttribute('aria-hidden', 'true');
      inner.textContent = word;
      inner.style.setProperty('--w', i);
      mask.appendChild(inner);
      el.appendChild(mask);
      el.appendChild(document.createTextNode(' '));
    });
  };
  headings.forEach(wrapWords);
  document.addEventListener('bonta:lang', () => headings.forEach(wrapWords));

  /* ---------- Things appear as they scroll into view ---------- */
  const mark = (selector, kind) => document.querySelectorAll(selector).forEach((el) => {
    el.classList.add('rv', el.matches('h1, h2') ? 'rv-words' : kind);
  });
  mark('.hero__copy > *, .section__head > *, .team__copy > *, .visit__copy > h2, .details > div, .visit__actions > *, .foot__inner > *', 'rv-up');
  mark('.dish', 'rv-card');
  mark('.made__list > li', 'rv-made');
  mark('.hero__photo, .visit__photo', 'rv-arch');

  const seen = new IntersectionObserver((entries) => {
    let i = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--i', i++);        // things arriving together follow one another
      entry.target.classList.add('in');
      seen.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv').forEach((el) => seen.observe(el));

  /* ---------- Things that move with the scroll ----------
     Each one gets a number from 0 to 1 (--p) for how far it has come into view; the CSS does the rest. */
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const linked = [];
  const link = (selector, run) => document.querySelectorAll(selector).forEach((el) => linked.push({ el, run, on: false }));
  const arrive = (span) => (el, r, vh) => el.style.setProperty('--p', ease(clamp((vh - r.top) / (vh * span), 0, 1)).toFixed(4));

  link('.made', arrive(0.62));                 // the green room opens like an arch
  link('.visit', arrive(0.62));                // ...and so does the last one
  link('.room__grid', arrive(0.8));            // the three photos fan out from a stack
  link('.team__photo', arrive(0.85));          // the team photo swings round to face you
  link('.dish__photo img, .made__photo img, .room__photo img, .visit__photo img', (el, r, vh) => {
    el.style.setProperty('--py', clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1).toFixed(3));
  });
  link('.tiles', (el) => {
    const tx = `${(-((window.scrollY * 0.18) % 44)).toFixed(1)}px`;
    el.style.setProperty('--tx', tx);
    const dome = el.previousElementSibling;                 // the tile dome over the 3D scene slides with its strip
    if (dome && dome.classList.contains('cap')) dome.style.setProperty('--tx', tx);
  });

  const near = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { const item = linked.find((l) => l.el === entry.target); if (item) item.on = entry.isIntersecting; });
    schedule();
  }, { rootMargin: '25% 0px 25% 0px' });
  linked.forEach((l) => near.observe(l.el));

  // The room photos start in a pile in the middle: work out how far each one is from the centre.
  const grid = document.querySelector('.room__grid');
  const measure = () => {
    if (!grid) return;
    const g = grid.getBoundingClientRect();
    [...grid.children].forEach((el) => {
      const was = el.style.transform;
      el.style.transform = 'none';
      const r = el.getBoundingClientRect();
      el.style.transform = was;
      el.style.setProperty('--dx', `${(g.left + g.width / 2 - (r.left + r.width / 2)).toFixed(1)}px`);
      el.style.setProperty('--dy', `${(g.top + g.height / 2 - (r.top + r.height / 2)).toFixed(1)}px`);
    });
  };

  let queued = false;
  const run = () => {
    queued = false;
    const vh = window.innerHeight;
    setHeader();
    if (topbar) {
      const max = document.documentElement.scrollHeight - vh;
      topbar.style.setProperty('--read', max > 0 ? clamp(window.scrollY / max, 0, 1).toFixed(4) : '0');
    }
    linked.forEach((l) => { if (l.on) l.run(l.el, l.el.getBoundingClientRect(), vh); });
  };
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(run); } }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { measure(); schedule(); });
  window.addEventListener('load', () => { measure(); schedule(); });
  window.addEventListener('bonta:tour', () => { measure(); schedule(); });
  measure();
  schedule();
})();
