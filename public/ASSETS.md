# Brand assets to add

Drop these files into `/public` before deploying. The site runs without them in
development, but they are required for a polished production launch.

| File | Size | Purpose |
| --- | --- | --- |
| `logo.png` | ~512×512, transparent | The official Dar Tahara logo (used in `<Logo variant="full" />`, JSON-LD & rich results). **Do not redesign — use the supplied artwork.** |
| `apple-icon.png` | 180×180 | iOS home-screen icon. |
| `og.jpg` *(optional)* | 1200×630 | Static social share image. Not required — a branded Open Graph card is generated automatically at `/[locale]/opengraph-image`. |
| `images/social/dar-tahara-early-access-v1.jpg` | 1200×630 | Versioned Open Graph and X preview for every localized Early Access route. |

The favicon is generated from `src/app/icon.svg` (dome-arch mark echoing the logo) — no action needed.
