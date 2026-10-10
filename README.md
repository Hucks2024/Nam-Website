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

Taken from the restaurant itself: butter-yellow walls, sage-green arched windows (every photo sits in an arch),
the green-and-white striped awning and the green quatrefoil cement tiles from the dining-room floor.
Fonts: Cormorant Garamond for headings, Be Vietnam Pro for text (it handles Vietnamese accents well),
and Dancing Script for the little Italian phrases.

## What's on the page

1. **Hero**: "Handmade pasta, proper pizza and a spritz in the sun." with the carbonara and a call-to-book button.
2. **Food**: fritto misto, ravioli al pesto, tagliatelle with burrata and Italian wine.
3. **Fresh pasta**: roll, fill, cover, cut. The ravioli process in four photos.
4. **The room**: the dining room, the bar, the Aperol cart.
5. **The team**: the crew in the green aprons on opening day (22 August 2026).
6. **Visit**: address, phone, Zalo, WhatsApp and Google Maps.

Tap any photo to see it full size.

## Still to fill in

Search `index.html` for `EDIT:` to find each spot.

- [ ] **Street address.** Only "Phường Trấn Biên, Biên Hòa, Đồng Nai" is on the site; the street number on the banner photo was too blurry to read.
- [ ] **Opening hours.** The Visit section says they're coming soon.
- [ ] **Google Maps link.** It currently searches for "Bontà Pizza Pasta Cafe Biên Hòa". Swap in the real place link (Google Maps → Share) once the listing exists.
- [ ] **Zalo / WhatsApp.** Both use 0366 664 930; check that number is set up on each app.
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
