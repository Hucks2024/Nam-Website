# Bontà · Pizza · Pasta · Cafe

The website for Bontà, an Italian pizza, pasta and café house in Biên Hòa, Đồng Nai.
Live at **https://hucks2024.github.io/Nam-Website/** (GitHub Pages, published from the `master` branch).

No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html        the website
css/styles.css    all styling
js/main.js        mobile menu, tap-a-photo viewer, footer year
images/           the restaurant's photos (each has a full size and a -sm phone size)
og-image.png      the preview picture shown when the link is shared (WhatsApp, Facebook, Zalo…)
favicon.svg       the arched-window browser icon
tools/            source and script for regenerating og-image.png
```

## The look

Taken from the restaurant itself: the real Bontà logo (`images/logo.png`, and `logo-cream.png` for dark backgrounds), butter-yellow walls, sage-green arched windows (every photo sits in an arch),
the green-and-white striped awning and the green quatrefoil cement tiles from the dining-room floor.
Fonts: Cormorant Garamond for headings, Be Vietnam Pro for text (it handles Vietnamese accents well),
and Dancing Script for the little Italian phrases.

## What's on the page

1. **Hero**: "Handmade pasta, proper pizza and a spritz in the sun." with the carbonara and a call-to-book button.
2. **Food**, starting with *Novità* (new on the menu: torta alla ricotta and tortino al cioccolato, 45k each), then four groups:
   *La pizza* (prosciutto e burrata, funghi e salsiccia, pepperoni, prosciutto & pesto fold), *Pasta & plates* (ravioli al pesto,
   tagliatelle & burrata, fritto misto, burrata e rucola), *Dolci & caffè* (tiramisù, pizza dolce, cornetti & cappuccino, limoncello)
   and *Da bere · drinks* (Aperol Spritz, Peroni, Italian wine, kombucha), then a burrata feature.
3. **Fresh pasta**: roll, fill, cover, cut. The ravioli process in four photos.
4. **Chef**: chef Manuel Reale, with his training and World Pizza Championship results (2014–2019), taken from his certificates,
   and the black-and-gold **Chef's menu**: Tomahawk (270.000₫ / 100 g, limited stock), Il Risotto (230.000₫) and Pizza del Sole (280.000₫),
   with the note that prices exclude 8% VAT and a 5% service charge.
5. **The room**: six photos of the dining room, the striped awning, the bar and the busy windows at night.
6. **The team**: the crew in the green aprons on opening day (22 August 2026).
7. **Visit**: E79–E80, đường D9, phường Trấn Biên, Biên Hòa, Đồng Nai; phone, Google Maps, Zalo, WhatsApp and Facebook,
   opening hours 10:00–22:00 with a live "open now" light, and the shop front at dusk and at night.

Tap any photo to see it full size.

## Time-limited offers

A slim bar above the header announces an offer and hides itself after a set date (Vietnam time).
Right now it promotes **Vietnamese Women's Day (20.10)**: book a table and receive a Mystery Box. It disappears on 21 October 2026.
For the next offer, edit the text in `<aside class="promo" data-until="2026-10-20">` in `index.html` and change `data-until` to the last day it should show.
Visitors can close it with the ×.

## Still to fill in

Search `index.html` for `EDIT:` to find each spot.

- [ ] **Opening hours.** 10:00–22:00 every day, from the dessert posters. If they change, update the Visit section and `OPEN_FROM` / `OPEN_UNTIL` in `js/main.js`.
- [ ] **Chef's menu prices.** Copied from the Chef Menu poster; update them in `index.html` if they change.
- [ ] **Pizza names.** "Pepperoni" and "Prosciutto & pesto fold" are descriptive names; swap in the names on the real menu.
- [ ] **New dishes.** The *Novità* row is for whatever is new; swap the two cards when the next dish launches.
- [ ] **Chef wording.** Check that Manuel is happy with how his role and awards are described.
- [ ] **Google Maps link.** It currently searches for the name and address. Swap in the real place link (Google Maps → Share) once the listing exists.
- [ ] **Facebook link.** It searches Facebook for "Bontà Pizza Pasta Cafe"; replace it with the page's own address
      (in the Facebook app: the page's ••• menu → Copy link).
- [ ] **Zalo / WhatsApp.** Both use 036 666 4930; check that number is set up on each app.
- [ ] **Dish descriptions.** Written from the photos; correct any names or ingredients that are off.

## Adding or swapping photos

Put the new photo in `images/`, ideally around 1200 px wide, plus a ~640 px wide copy ending in `-sm.jpg` for phones.
Then copy one of the existing `<li class="dish">` (or other photo) blocks in `index.html` and change the file names, caption and description.

## See it locally

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Share image

`og-image.png` is rendered from `tools/og-card.html`. After changing the headline or photo, re-render it:

```sh
npm i -D playwright && npx playwright install chromium
node tools/render-og.mjs
```
