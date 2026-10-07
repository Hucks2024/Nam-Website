/* Quán Nam: small progressive enhancements. The page works without any of this. */
(() => {
  'use strict';

  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } },
  };

  /* ---------- Design chooser (remove once a design is picked) ---------- */
  const DESIGNS = ['street', 'night', 'porcelain', 'poster', 'postcard'];
  const designButtons = $$('[data-design-pick]');
  const setDesign = (name, remember) => {
    const design = DESIGNS.includes(name) ? name : 'street';
    document.documentElement.dataset.design = design;
    designButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.designPick === design)));
    if (!remember) return;
    store.set('quannam-design', design);
    // Put the design in the address so a link opens straight to it (e.g. …/#night).
    try { history.replaceState(null, '', `#${design}`); } catch { /* not allowed here */ }
  };
  setDesign(document.documentElement.dataset.design, false);
  // On phones the tab row scrolls sideways: start with the current design in view.
  const current = designButtons.find((b) => b.getAttribute('aria-pressed') === 'true');
  if (current) {
    const row = current.parentElement;
    row.scrollLeft = current.getBoundingClientRect().left - row.getBoundingClientRect().left - 8;
  }
  designButtons.forEach((b) => b.addEventListener('click', () => setDesign(b.dataset.designPick, true)));
  window.addEventListener('hashchange', () => {
    const name = location.hash.slice(1);
    if (DESIGNS.includes(name)) setDesign(name, true);
  });

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

  /* ---------- What time is it in Saigon? ---------- */
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { fmt = null; }
    const tick = () => {
      if (!fmt) return;
      const time = fmt.format(new Date()).replace(/\s?([AP])M/i, (_, ap) => ` ${ap.toLowerCase()}m`);
      clock.textContent = `It's ${time} in Saigon. Somewhere, someone is slurping phở right now.`;
    };
    tick();
    setInterval(tick, 30 * 1000);
  }

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

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
