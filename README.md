# Bontà · Pizza · Pasta · Cafe

The website for Bontà, an Italian pizza, pasta and café house in Biên Hòa, Đồng Nai.
Live at **https://hucks2024.github.io/Nam-Website/** (GitHub Pages, published from the `master` branch).

No build step, no framework: plain HTML, CSS and JavaScript.

```
index.html        the website
css/styles.css    all styling
js/main.js        language switch, tap-a-photo viewer, "open now", footer year
js/i18n-vi.js     the Vietnamese text for the VI | EN switch
js/fx.js          the scroll transitions, and the loader for the 3D walk-in
js/journey.js     the 3D walk-in: the model of the restaurant and the camera path through it
js/vendor/        three.js, the 3D library the walk-in is drawn with (a copy kept here; MIT licence alongside)
images/           the restaurant's photos (each has a full size and a -sm phone size)
og-image.png      the preview picture shown when the link is shared (WhatsApp, Facebook, Zalo…)
favicon.svg       the arched-window browser icon
tools/            source and script for regenerating og-image.png
```

## The look

Taken from the restaurant itself: the real Bontà logo (`images/logo.png`, and `logo-cream.png` for dark backgrounds),
butter-yellow walls, a sage-green arched window and the green quatrefoil floor tiles.
Fonts: Cormorant Garamond for headings and Be Vietnam Pro for text (it handles Vietnamese accents well).

## What's on the page

A short, simple page built around what customers look for: when you're open, where you are, how to book, and the food.

1. **Header** (stays at the top while scrolling): logo, **VI | EN** switch and a **Call** button.
2. **Top screen**: what Bontà is, opening hours with a live "open now / closed now" light, the address,
   and **Call to book** and **Directions** buttons, over a 3D model of the restaurant at dusk.
   Scrolling from here walks you in (see "The 3D walk-in" below).
3. **Our food**: eight dishes with photos and one line each.
4. **Made in our own kitchen**: fresh pasta, homemade mozzarella and pizza by chef Manuel Reale.
5. **The restaurant**: three photos of the dining room.
6. **The team**: the crew in the green aprons on opening day (22 August 2026).
7. **Visit us**: address, hours, phone, and Call, Directions, Zalo and Facebook buttons, with the shop front.

Tap any photo to see it full size.

## The 3D walk-in

The top of the page is a small 3D model of Bontà, built in code from the restaurant's own look: the terracotta
and cream front, green arched windows, the canopy with its fairy lights and glowing sign, and inside, the yellow
dining room, the quatrefoil floor tiles and the skylight full of lanterns.

Scrolling moves a camera along a path:

1. across the street, with the headline, hours and **Call to book** beside the building;
2. up to the front and under the canopy as the doors swing open;
3. through the door into the dining room;
4. along the left wall, the back wall and the right wall, stopping at each photo with its name and description;
5. up into the lanterns, as the green floor tiles rise in an arch and the rest of the page takes over.

Things worth knowing:

- **The photos on the walls are the photos in the page.** The dishes in "Our food" hang on the side walls and the
  three "Made in our own kitchen" photos sit in the arches on the back wall. Add, remove or reorder a dish in
  `index.html` and the 3D room follows (up to ten dishes). Captions come from the same text, so they follow the
  VI | EN switch.
- **Tap a photo on the wall** to open it full size, the same as anywhere else on the page.
- **Skip the tour** (bottom right while walking) jumps straight to the food. The header with the **Call** button
  stays on screen the whole time.
- **It only runs where it can run well.** Browsers that cannot draw it get the ordinary top screen with the
  carbonara photo instead, with nothing missing. If the model fails to load, the page falls back to that screen by itself.
- **Reduce Motion is respected.** A visitor whose phone asks for less motion (iPhone: Settings → Accessibility →
  Motion → Reduce Motion) or less data also gets the ordinary top screen, plus a **See it in 3D** button, so the
  walk-in is their choice.
- While the model loads (a moment on a slow connection) the real photo of the shop front is shown in its place.
- To see the page without it, add `?3d=0` to the link. `?3d=1` forces it on, and if the model cannot start on that
  device it says why at the bottom of the screen.
- The rest of the page has its own scroll transitions (`js/fx.js` and the last part of `css/styles.css`):
  headlines rise word by word, dish photos open from an arch into their square, the green and dark-green sections
  open like arched doorways, the three dining-room photos fan out from a pile, and the team photo swings round.
  These are also switched off for visitors who ask for reduced motion.

To change how the model looks, edit `js/journey.js`: sizes are in metres at the top, colours are in `C`, and the
camera's stops are in `buildKeys()`.

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

- **No prices, no "new" labels, no offers or dated posters.** The page shows the food; the team gives today's prices.
- **The menu is described as a sample** ("some of our favourites… the menu changes with the seasons"), so it stays right as dishes change.
- **The footer year updates itself**, and the "open now" light always uses Vietnam time.
- **No outside code.** Everything runs from this repository on GitHub Pages; only the fonts come from Google Fonts, with standard fonts as a fallback.
  The 3D library is a copy kept in `js/vendor/`, so nothing can change or disappear underneath the site.

### After changing a CSS or JS file

Raise the `?v=` number wherever it appears in `index.html` (search for `?v=`; they should all match). Phones keep
files for a few minutes after a visit, and the number makes them fetch the new ones together instead of mixing new
and old.

### The only things that would ever need changing

- **Opening hours** (10:00-22:00 every day): in the Visit section of `index.html`, change the text and the `data-open` / `data-close`
  values on the same line, plus `"openingHours"` in `<head>`. The "open now" light reads them from there.
- **Phone number or address**, if they change.
- **Google Maps link**: it currently searches for the restaurant's name and address. Swapping in the exact place link (Google Maps → Share) is optional.

Search `index.html` for `EDIT:` to find each spot. Dish names and descriptions were written from photos; correct any that are off.

## Adding or swapping photos

Put the new photo in `images/`, ideally around 1200 px wide, plus a ~640 px wide copy ending in `-sm.jpg` for phones.
Then copy one of the existing `<li class="dish">` (or other photo) blocks in `index.html` and change the file names, caption and description.

## See it locally

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Updating the 3D library

`js/vendor/three.module.min.js` is three.js r187, bundled into one minified file. It never needs updating for the site
to keep working. To move to a newer version:

```sh
npm i three esbuild
echo "export * from 'three';" > three-entry.js
npx esbuild three-entry.js --bundle --minify --format=esm --target=es2020 --outfile=js/vendor/three.module.min.js
```

Keep `--target=es2020`: without it the file uses newer JavaScript that iPhones on iOS older than 16.4 cannot read,
and those phones silently fall back to the ordinary top screen.

Then check the walk-in still looks right, and copy `node_modules/three/LICENSE` over `js/vendor/three.LICENSE.txt`.

## Share image

`og-image.png` is rendered from `tools/og-card.html`. After changing the headline or photo, re-render it:

```sh
npm i -D playwright && npx playwright install chromium
node tools/render-og.mjs
```
