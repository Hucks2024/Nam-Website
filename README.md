# Quán Nam: family kitchen website

A one-page static website for Nam's family-run Vietnamese restaurant in Ho Chi Minh City, written for backpackers and travellers.
No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html          the website
css/styles.css      all styling (light and dark mode)
js/main.js          menu filters, currency toggle, "open now" in Saigon time, copy-address button, phone action bar
flyer.html          printable A4 sheet of four hostel flyers with a QR code to the site
og-image.png        the preview picture shown when the link is shared (WhatsApp, Facebook, Zalo…)
favicon.svg         the little red stool
js/vendor/qrcode.js QR code generator used by the flyer (MIT licence, Kazuhiko Arase)
tools/              source and script for regenerating og-image.png
```

## See it locally

Open `index.html` in a browser, or run a tiny server from this folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Put it online (free)

**GitHub Pages:** push this repo to GitHub, then go to *Settings → Pages*, choose *Deploy from a branch*, pick your main branch and the `/ (root)` folder. The site appears at `https://<username>.github.io/<repo>/` within a minute or two.

Netlify, Cloudflare Pages or Vercel also work: drag the folder in, no settings needed.

## Before it goes live: things to fill in

Search `index.html` for `EDIT:` to find each spot.

- [ ] **Restaurant name.** "Quán Nam" is a stand-in. Change it in the `<title>`, header, footer and the JSON-LD block in `<head>`.
- [ ] **Address.** The blue house-number plate and the "Show this to your Grab driver" card use a sample address (`123 Đường Mẫu`; *mẫu* means "sample").
- [ ] **Directions.** The "down a small alley, yellow sign, red stools" line in *Find us*.
- [ ] **Links.** Google Maps (ideally the real place link from Google Maps → Share), WhatsApp and Zalo numbers (`84XXXXXXXXX`), Instagram handle. The phone action bar copies the Maps and WhatsApp links from the *Find us* buttons, so you only change them once.
- [ ] **Google review link.** Replace `YOUR_PLACE_ID` once the restaurant has a Google Business Profile (look it up with Google's Place ID Finder).
- [ ] **Opening hours.** The `<tr>` rows in the hours table. `data-days` uses `0` = Sunday … `6` = Saturday and `data-open` / `data-close` use 24-hour Saigon time. The "Open now" badge reads these.
- [ ] **Menu and prices.** Each dish is an `<li class="dish">`. `data-vnd` is the price in đồng, `data-cat` is `noodles`, `rice`, `share` or `sweet`, and `data-veg="true"` puts it under the Veggie filter. Update the visible `55k` / `55.000 ₫` text to match.
- [ ] **Family story.** Grandma, Mum, Nam and the cat are written as a starting point. Rewrite them to fit the real family.
- [ ] **House perks.** Free iced tea, cash or QR payment, the Tết closure note: keep only what's true.
- [ ] **Exchange rates.** `RATES` at the top of `js/main.js`.
- [ ] **Web address.** The share-preview tags in `<head>` and `SITE_URL` in `flyer.html` assume `https://hucks2024.github.io/Nam-Website/`. Update them if you use your own domain.
- [ ] **Flyer.** Dishes and prices on `flyer.html` are typed separately from the menu, so keep them in step.

## Hostel flyers

Open `flyer.html` on the live site and press **Print flyers**. You get four A6 flyers on one A4 sheet; cut along the dashed lines.
The QR code points at whatever address the flyer page was opened from, so it is always right for the live site.

## Share image

`og-image.png` is rendered from `tools/og-card.html`. After changing the name or the headline, re-render it:

```sh
npm i -D playwright && npx playwright install chromium
node tools/render-og.mjs
```

## Nice next steps

- Real photos of the food, the family and the street front. They'll do more than anything else on the page.
- A Google Business Profile so the restaurant shows up on Google Maps with reviews.
- A Vietnamese-language version for local customers.
