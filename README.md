# Bontà · Pizza · Pasta · Cafe

The website for Bontà, an Italian pizza, pasta and café house in Biên Hòa, Đồng Nai.
Live at **https://hucks2024.github.io/Nam-Website/** (GitHub Pages, published from the `master` branch).

No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html        the website
css/styles.css    all styling
js/main.js        language switch, mobile menu, tap-a-photo viewer, "open now", footer year
js/i18n-vi.js     the Vietnamese text for the VI | EN switch
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
2. **Food**: *La pizza* (prosciutto e burrata, funghi e salsiccia, pepperoni, prosciutto & pesto fold), *Pasta & plates*
   (ravioli al pesto, tagliatelle & burrata, fritto misto, burrata e rucola), *Dolci* (tiramisù, torta alla ricotta,
   tortino al cioccolato, pizza dolce) and *Caffè & drinks* (cornetti & cappuccino, Aperol Spritz, Italian wine, limoncello),
   then the homemade mozzarella feature.
3. **Fresh pasta**: roll, fill, cover, cut. The ravioli process in four photos.
4. **Chef**: chef Manuel Reale and his training and World Pizza Championship results (2014–2019), taken from his certificates,
   then the black-and-gold **chef's menu** showing plates it has featured (Tomahawk, Il Risotto, Pizza del Sole).
5. **The room**: six photos of the dining room, the striped awning, the bar and the busy windows at night.
6. **The team**: the crew in the green aprons on opening day (22 August 2026).
7. **Visit**: E79–E80, đường D9, phường Trấn Biên, Biên Hòa, Đồng Nai; phone, Google Maps, Zalo, WhatsApp and Facebook,
   opening hours 10:00–22:00 with a live "open now" light, and the shop front at dusk and at night.

Tap any photo to see it full size.

## English and Tiếng Việt

The **VI | EN** switch in the header changes the whole page, including photo captions, the "open now" line and screen-reader text.

- The English is written in `index.html`. The Vietnamese lives in `js/i18n-vi.js`, matched by key: an element with
  `data-i18n="hero.title"` shows `"hero.title"` from that file when Vietnamese is on. Photos use `data-i18n-alt` and `data-i18n-caption`.
- First-time visitors whose phone or browser is set to Vietnamese see Vietnamese; everyone else sees English. After that the site remembers their choice.
- Add `?lang=vi` or `?lang=en` to a link to open it in that language: `https://hucks2024.github.io/Nam-Website/?lang=vi`.
- When you change or add English text, update the matching line in `js/i18n-vi.js` too, or that spot stays in English.
- The chef's menu and the new desserts use Bontà's own Vietnamese wording from their posters.

## Built to last

The page is written so it stays true for years without editing:

- **No prices, no "new" labels, no offers or dated posters.** Prices and specials change; the page shows the food, and the team gives today's prices.
- **The menu is described as a sample.** "A few of our favourites" and "a few of the plates the chef's menu has featured", so it stays right as dishes come and go.
- **Past facts are written in the past tense.** The opening date and the chef's awards are history, so they never go out of date.
- **The year in the footer updates itself**, and the "open now" light always uses Vietnam time.
- **No outside code.** Everything runs from this repository on GitHub Pages; the only outside service is Google Fonts, and if that ever fails the page falls back to standard fonts.
- **Link previews** use a fixed image in the repo.

### The only things that would ever need changing

- **Opening hours** (10:00–22:00 every day): in the Visit section of `index.html`, change the text and the `data-open` / `data-close`
  values on the same line, plus `"openingHours"` in `<head>`. The "open now" light reads them from there.
- **Phone number or address**, if they change.
- **Google Maps / Facebook links**: they currently search for the restaurant. Swapping in the exact page links is optional.

Search `index.html` for `EDIT:` to find each spot. Dish names and descriptions were written from photos; correct any that are off.

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
