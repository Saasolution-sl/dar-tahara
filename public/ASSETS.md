# Brand assets to add

Drop these files into `/public` before deploying. The site runs without them in
development, but they are required for a polished production launch.

| File | Size | Purpose |
| --- | --- | --- |
| `logo.png` | ~512×512, transparent | Optional official raster logo for future rich-result use. JSON-LD currently uses the existing crawlable `/icon.svg`; update `site.logoUrl` only when approved artwork is supplied. **Do not redesign it. Use the supplied artwork.** |
| `apple-icon.png` | 180×180 | iOS home-screen icon. |
| `og.jpg` *(optional)* | 1200×630 | Static social share image. Not required because a branded Open Graph card is generated automatically at `/[locale]/opengraph-image`. |
| `images/social/dar-tahara-early-access-v1.jpg` | 1200×630 | Versioned Open Graph and X preview for every localized Early Access route. |

The favicon is generated from `src/app/icon.svg` (a dome-arch mark echoing the logo), so no action is needed.
