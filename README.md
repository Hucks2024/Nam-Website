# Quán Nam: family kitchen website

A one-page static website for Nam's family-run Vietnamese restaurant in Ho Chi Minh City, written for backpackers and travellers.
No build step, no framework: plain HTML, CSS and a little JavaScript.

```
index.html      the page
css/styles.css  all styling (light and dark mode)
js/main.js      menu filters, currency toggle, "open now" in Saigon time, copy-address button
favicon.svg     the little red stool
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
- [ ] **Links.** Google Maps (ideally the real place link from Google Maps → Share), WhatsApp and Zalo numbers (`84XXXXXXXXX`), Instagram handle.
- [ ] **Opening hours.** The `<tr>` rows in the hours table. `data-days` uses `0` = Sunday … `6` = Saturday and `data-open` / `data-close` use 24-hour Saigon time. The "Open now" badge reads these.
- [ ] **Menu and prices.** Each dish is an `<li class="dish">`. `data-vnd` is the price in đồng, `data-cat` is `noodles`, `rice`, `share` or `sweet`, and `data-veg="true"` puts it under the Veggie filter. Update the visible `55k` / `55.000 ₫` text to match.
- [ ] **Family story.** Grandma, Mum, Nam and the cat are written as a starting point. Rewrite them to fit the real family.
- [ ] **House perks.** Free iced tea, cash or QR payment, the Tết closure note: keep only what's true.
- [ ] **Exchange rates.** `RATES` at the top of `js/main.js`.

## Nice next steps

- Real photos of the food, the family and the street front. They'll do more than anything else on the page.
- A Google Business Profile so the restaurant shows up on Google Maps with reviews.
- A Vietnamese-language version for local customers.
