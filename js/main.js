/* Quán Nam: small progressive enhancements. The page works without any of this. */
(() => {
  'use strict';

  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

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
