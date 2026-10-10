/* Bontà: small progressive enhancements. The page works without any of this. */
(() => {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector('.navtoggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

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

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
