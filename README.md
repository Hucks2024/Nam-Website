# Quán Nam: family kitchen website

A one-page website for Nam's family-run Vietnamese kitchen in Ho Chi Minh City, made to get backpackers and travellers excited to come and eat.
No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html      the website
css/styles.css  shared layout + Design 1 (Street stall)
css/designs.css Designs 2–5 and the "Pick a design" bar
js/main.js      design chooser, mobile menu button, live Saigon clock, "Hear it" buttons
og-image.png    the preview picture shown when the link is shared (WhatsApp, Facebook, Zalo…)
favicon.svg     the little red stool
tools/          source and script for regenerating og-image.png
```

## Five designs to choose from

A dark bar at the top of the page switches between five looks. The words and sections are the same in each, so it's a fair comparison.

| # | Design | The idea |
|---|--------|----------|
| 1 | **Street stall** | Yellow shop sign, red plastic stools, hand-painted signboards and cement-tile borders |
| 2 | **Night market** | Saigon after dark: glowing neon-tube signs in pink, cyan and yellow |
| 3 | **Porcelain** | Blue-and-white Vietnamese ceramics: calm, elegant and centred, with a red potter's seal |
| 4 | **Retro poster** | Old Saigon poster art: red and gold sunbursts, huge condensed capitals |
| 5 | **Postcard** | A backpacker's postcard home: airmail stripes, a perforated stamp, postmarks and washi tape |

To send someone straight to one design, add its name to the link: `…/Nam-Website/#night`, `#porcelain`, `#poster`, `#postcard` or `#street`.

Once a favourite is picked, the other four and the chooser bar get removed so the site only carries one design.

## What's on the page

1. **Hero**: "Pull up a plastic stool." with a steaming bowl of phở on a red stool.
2. **Why come**: four hand-painted-sign reasons to eat here instead of at a tourist restaurant.
3. **The family**: Grandma, Mum, Nam and the cat.
4. **Eat like a local**: how to eat phở, street-food etiquette and a phrasebook with pronunciations.
5. **Visit**: "See you on a plastic stool." The address and opening hours are marked as coming soon.

## See it locally

Open `index.html` in a browser, or run a tiny server from this folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Put it online (free)

**GitHub Pages:** in this repo on GitHub, go to *Settings → Pages*, choose *Deploy from a branch*, pick `master` and the `/ (root)` folder. The site appears at `https://hucks2024.github.io/Nam-Website/` within a minute or two.

Netlify, Cloudflare Pages or Vercel also work: drag the folder in, no settings needed.

## Things to check before sharing it

Search `index.html` for `EDIT:` to find each spot.

- [ ] **Restaurant name.** "Quán Nam" is a stand-in. Change it in the `<title>`, header, footer and the JSON-LD block in `<head>`.
- [ ] **Family story.** Grandma, Mum, Nam and the cat are a starting point. Rewrite them to fit the real family.
- [ ] **Why come.** The four signboards make general promises (home cooking, local prices, help with tips). Keep only what's true.
- [ ] **Web address.** The share-preview tags in `<head>` assume `https://hucks2024.github.io/Nam-Website/`. Update them if you use your own domain.

## Later, when the details are ready

The **Visit** section is where the address, opening hours, a Google Maps link and WhatsApp/Zalo/Instagram links go. Send them over and they can be added in a few minutes.

## Share image

`og-image.png` is rendered from `tools/og-card.html`. After changing the name or the headline, re-render it:

```sh
npm i -D playwright && npx playwright install chromium
node tools/render-og.mjs
```
