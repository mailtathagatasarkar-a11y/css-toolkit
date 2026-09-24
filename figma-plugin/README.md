# CSS Toolkit: Figma plugin

The six CSS Toolkit tools inside Figma, filled from whatever layer you select. The plugin only reads your file and never changes it.

- **PX / REM, PX / VW, PX / VH:** select a layer and its font size (for text) or width/height fills in automatically. VW and VH are measured against the layer's frame, so a 320px card in a 1440px frame shows 22.222vw. Chips switch between font size, width and height.
- **REM / EM:** a text layer's font size becomes the parent font size.
- **CSS / TAILWIND:** turns the selected layer's CSS (from Figma's own CSS export) into Tailwind v4 classes.
- **CSS / INLINE:** paste HTML with a `<style>` block to get inline styles, or use the selected layer's CSS.

## Try it in Figma (desktop app)

No install or build needed: `ui.html` is committed and ready.

1. Download the repo: **Code → Download ZIP** on https://github.com/mailtathagatasarkar-a11y/css-toolkit, then unzip it.
2. In Figma: **Plugins → Development → Import plugin from manifest…** and pick `figma-plugin/manifest.json`.
3. Run it from **Plugins → Development → CSS Toolkit**. It also shows up in Dev Mode's plugin list.

## How it's built

`ui.html` is generated, so don't edit it by hand. After changing any source, run `npm run build:plugin` and commit the result; a test fails if the committed file is out of date. Figma loads a plugin UI as a single HTML string, so `scripts/build-plugin.mjs` inlines the site's calculator markup, `styles.css` and the shared logic (`logic.js`, `tailwind.js`, `inline.js`, `tools.js`, `app.js`), plus the plugin-only files in `src/`:

- `src/bridge.js`: talks to Figma and fills the tools from the selection.
- `src/plugin.css`: layout adjustments for the plugin window.
- `src/ui.template.html`: the plugin page shell.

`code.js` runs in Figma's main thread. It reads the selection (size, font size, `getCSSAsync()` and the top-level frame) and resizes the window to fit.

## Publishing updates

The plugin is published on the Figma Community with ID `1684920820196716785` (in `manifest.json`; a test guards it). To ship an update: rebuild, then in Figma choose **Plugins → Manage plugins → CSS Toolkit → Publish new version**.
