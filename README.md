# CSS Toolkit

Free CSS converters that run entirely in your browser. Nothing you type or paste is uploaded.

**Live:** https://css-toolkit-app.netlify.app

| Tool | What it does |
| --- | --- |
| PX / REM | Pixels ⇄ rem against any root font size |
| REM / EM | rem ⇄ em from the root and parent font sizes |
| PX / VW, PX / VH | Pixels ⇄ viewport units, with screen presets |
| CSS / INLINE | Moves `<style>` rules into inline `style` attributes for email |
| CSS / TAILWIND | Converts CSS rules, states and breakpoints into Tailwind v4 classes |

It's plain HTML, CSS and ES modules, with no framework and no dependencies.

```bash
npm run dev          # http://localhost:4173
npm test             # node --test
npm run build        # dist/, what Netlify publishes
npm run build:plugin # figma-plugin/ui.html
```

The same tools also run as a Figma plugin. See [figma-plugin/README.md](figma-plugin/README.md).

Made by Tathagata Sarkar · [Buy me a coffee](https://buymeacoffee.com/98kid)
