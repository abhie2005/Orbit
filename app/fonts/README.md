# Licensed display fonts

Orbit's type system names two commercial faces **first** in every font stack:

| Role | Font | Where it is used |
| --- | --- | --- |
| Display (h1, "important") | **Caesura** | Always rendered ALL CAPS and bold |
| Heading 2 | **Peristiva** | Section headings only — never body copy |

Neither ships with this repo: Caesura is licensed from
[Black\[Foundry\]](https://black-foundry.com/fonts/caesura/) (also on Adobe Fonts),
and Peristiva is likewise a licensed face. Until the files are added, the stacks
fall back to close free stand-ins (Bodoni Moda and Instrument Serif) so the
layout and rhythm are already correct.

## Adding the real fonts — one step

Drop the web files into this directory:

```
app/fonts/Caesura.woff2
app/fonts/Peristiva.woff2
```

then uncomment the two `@font-face` blocks at the bottom of `app/globals.css`.

Nothing else changes: `--font-display` and `--font-heading` already list
`"Caesura"` and `"Peristiva"` ahead of the fallbacks, so the browser picks them
up the moment they resolve.

**If you use Adobe Fonts instead**, create a web project, then add its
stylesheet `<link>` in `app/layout.tsx`. The family names must match the stacks.
