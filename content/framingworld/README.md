# Framing World content

Everything in this folder was taken from the live store at https://framingworld.in
on 14 November 2026 (public pages and Shopify's public product feed). It is the
source material for this site: the storefront reads some of it directly, and the
rest is imported into the database with the seed script.

## Files

| File | What it holds | Used by |
| --- | --- | --- |
| `brand.json` | Name, tagline, contact details, social links, colours, typography, menu and footer structure | Reference (values are applied in `app/globals.css`, `lib/site-content.ts`) |
| `home.json` | Home page sections: hero slides, marquee, product rows, collection tiles, consultation, founder, benefits, SEO copy | Reference (applied in `lib/server/dal/banners.ts`, `components/home/*`) |
| `pages.json` | 11 information pages (About, Printing Services, Archival Printing, Diasec Mounting, Face Mounting, Laser Cutting, Mount Cutting, CNC Router, Gallery, FAQs, Contact) | `/pages/[slug]` |
| `faqs.json` | FAQ groups with question / answer pairs | `/pages/faqs`, contact page FAQs (`lib/site-content.ts`) |
| `privacy-policy.json` | The store's privacy policy | Default privacy policy (`lib/site-content.ts`) |
| `blog.json` | 92 blog articles, newest first | `/blogs/news`, `/blogs/news/[slug]` |
| `catalog/products.json` | 171 products with 7,531 variants, options, prices and image lists | `npm run db:seed` |
| `catalog/collections.json` | 14 collections with their product order | `npm run db:seed` |
| `assets-manifest.json` | Every downloaded file: local path → original URL | Reference |
| `image-sizes.json` | Pixel size of every downloaded image | `lib/framingworld-content.ts` (image width / height) |

## Downloaded files (in `public/`)

- `public/brand/` – logo, favicon, social share image
- `public/images/home/` – hero slides and home page photos
- `public/images/pages/<page>/` – photos used on the information pages
- `public/images/blog/<article>/` – article covers and inline pictures
- `public/images/catalog/<product>/` – product photos (924 files, up to 1600 px wide)
- `public/fonts/outfit/`, `public/fonts/playfair-display/` – the two site typefaces (SIL Open Font License)

## Text format

Page and article content is a list of blocks: `heading`, `paragraph`, `list`,
`image`, `video`. Text can contain `[label](href)` links and `**bold**`.
Links already point at this site's routes (`/collections/...`, `/products/...`,
`/pages/...`, `/blogs/news/...`, `/contact`, `/shop`).

## Left out on purpose

- Placeholder text and media from the Shopify theme that was still on the live
  site: the furniture copy, shoe reviews and "Seafolly" store counts on the
  About page, and the theme's stock furniture video.
- One blog picture that is a dead link on the live site.
- Shopify's empty system collection ("Home page").

## Loading the catalogue

```bash
npm run db:deploy        # create the tables
npm run db:seed          # products, variants, images, categories, collections
npm run db:seed:banners  # optional: home page banners as editable records
```

The seed skips anything that already exists (matched by slug), so it is safe to
run again.
