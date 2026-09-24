# Figma Community listing: CSS Toolkit

Copy each field into Figma's publish dialog. Figma Community search matches the **name, tagline, description and tags**, so the wording repeats the exact phrases people search for: "px to rem", "rem calculator", "vw calculator", "css to tailwind", "inline css".

## Name

```
CSS Toolkit: PX to REM, VW & Tailwind
```

The three most-searched tools go in the name. If Figma shortens long names, fall back to `CSS Toolkit`, since the tagline and tags still carry the keywords.

## Tagline

```
PX to REM, EM, VW & VH calculator, CSS to Tailwind converter and CSS inliner, right from your layers.
```

## Description

```
Every CSS calculator you reach for during handoff, in one plugin, filled in from the layer you select.

PX TO REM CALCULATOR
Select a text layer and its font size converts to rem instantly (px to rem and rem to px). Width and height work too. Set any root font size (14, 16, 18, 20px or custom) and 0–4 decimal places. Every result shows the formula and the worked sum.

REM TO EM CALCULATOR
Convert rem to em and em to rem using the root and parent font sizes. A text layer's size becomes the parent font size.

PX TO VW AND PX TO VH CALCULATOR
Viewport units measured on the frame your layer sits in: a 480px card in a 1440px frame is 33.333vw. Switch to common screens (1920×1080, 1440×900, 1366×768, 375×667) or type any viewport width or height.

CSS TO TAILWIND CONVERTER
Select any layer and get Tailwind v4 classes from its CSS: spacing, sizing, colours, radius, shadows, flex and grid. Paste your own CSS to convert hover and focus states and breakpoints (sm:, md:, lg:) too. Values without a Tailwind class use arbitrary values, so nothing is dropped.

CSS INLINER FOR EMAIL
Turn HTML with a <style> block into inline style attributes for email templates. Specificity and !important are respected, your values are kept exactly as written, and hover and media-query rules stay in a <style> block where email clients expect them.

PRIVATE BY DESIGN
Everything runs inside the plugin. It only reads your selection and never edits your file. Nothing you select, type or paste leaves Figma.

WANT A CALCULATOR THAT ISN'T HERE?
New calculators are added on request. Use "Request a calculator" in the plugin footer, or open an issue at github.com/mailtathagatasarkar-a11y/css-toolkit. Popular requests get built next.

Also on the web: css-toolkit-app.netlify.app
Made by Tathagata Sarkar. If it saves you time, you can buy me a coffee: buymeacoffee.com/98kid
```

## Tags

Use as many as Figma allows, in this order:

```
px to rem, rem, vw, vh, em, tailwind, css to tailwind, css, calculator, unit converter, inline css, developer handoff
```

## Images

All images are in this folder and were rendered from the real plugin UI.

| Field | File | Size |
| --- | --- | --- |
| Icon | `icon-128.png` | 128 × 128 |
| Cover / thumbnail | `cover.png` | 1920 × 1080 |
| Carousel 1 | `1-px-to-rem.png` | 1920 × 1080 |
| Carousel 2 | `2-vw-vh.png` | 1920 × 1080 |
| Carousel 3 | `3-tailwind.png` | 1920 × 1080 |
| Carousel 4 | `4-inline.png` | 1920 × 1080 |
| Carousel 5 | `5-rem-em.png` | 1920 × 1080 |

To re-render after a UI change, serve the project (`npm run dev`) and open `figma-plugin/listing/src/slide.html` with the query parameters described in its header comment.

## Other fields

- **Support contact:** `https://github.com/mailtathagatasarkar-a11y/css-toolkit/issues`
- **Data and security questions:** the plugin collects no data, stores nothing and sends nothing anywhere. Its only network access is Google Fonts (DM Sans, Space Grotesk) for the UI typefaces. It reads the current selection and never writes to the file.
- **Editor support:** Figma Design and Dev Mode.

## After publishing

Published with plugin ID `1684920820196716785`, which is set in `figma-plugin/manifest.json`. Every future update must be published with that ID.
