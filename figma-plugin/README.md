# CSS Toolkit: Figma plugin

The six CSS Toolkit tools inside Figma, filled from whatever layer you select. The plugin only reads your file and never changes it.

- **PX / REM, PX / VW, PX / VH:** select a layer and its font size (for text) or width/height fills in automatically. VW and VH are measured against the layer's frame, so a 320px card in a 1440px frame shows 22.222vw. Chips switch between font size, width and height.
- **REM / EM:** a text layer's font size becomes the parent font size.
- **CSS / TAILWIND:** turns the selected layer's CSS (from Figma's own CSS export) into Tailwind v4 classes.
- **CSS / INLINE:** paste HTML with a `<style>` block to get inline styles, or use the selected layer's CSS.

## Try it in Figma (desktop app)

1. From the project root, run `npm run build:plugin`. This writes `figma-plugin/ui.html`.
2. In Figma: **Plugins → Development → Import plugin from manifest…** and pick `figma-plugin/manifest.json`.
3. Run it from **Plugins → Development → CSS Toolkit**. It also shows up in Dev Mode's plugin list.

## How it's built

`ui.html` is generated, so don't edit it by hand. Figma loads a plugin UI as a single HTML string, so `scripts/build-plugin.mjs` inlines the site's calculator markup, `styles.css` and the shared logic (`logic.js`, `tailwind.js`, `inline.js`, `tools.js`, `app.js`), plus the plugin-only files in `src/`:

- `src/bridge.js`: talks to Figma and fills the tools from the selection.
- `src/plugin.css`: layout adjustments for the plugin window.
- `src/ui.template.html`: the plugin page shell.

`code.js` runs in Figma's main thread. It reads the selection (size, font size, `getCSSAsync()` and the top-level frame) and resizes the window to fit.

## Publishing to the Community

When publishing, Figma assigns a real plugin ID. Replace `"id": "css-toolkit-dev"` in `manifest.json` with it, then rebuild.
