# Quán Nam: family kitchen website

A one-page website for Nam's family-run Vietnamese kitchen in Ho Chi Minh City, made to get backpackers and travellers excited to come and eat.
No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html      the website
css/styles.css  all styling (light and dark mode)
js/main.js      mobile menu button, live Saigon clock, "Hear it" buttons for the phrasebook
og-image.png    the preview picture shown when the link is shared (WhatsApp, Facebook, Zalo…)
favicon.svg     the little red stool
tools/          source and script for regenerating og-image.png
```

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
