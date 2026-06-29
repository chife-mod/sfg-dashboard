# Vsevolod — shared dashboard base (the master)

**One** per-project dashboard chrome for **all Vsevolod / SF Group subprojects.**
Hosted once here, loaded by every subproject. There is **no per-project copy**
of the chrome — so dashboards can't drift. Scope: **Vsevolod only** (other
clients get their own base; do not make this global).

Live base URL: `https://chife-mod.github.io/sfg-dashboard/base/`

## What's in the base

| File | Role |
|---|---|
| `launcher.css` | All dashboard chrome styles (dark launcher, cards, stages, meta). |
| `launcher.js` | Renders the whole launcher from `window.PREVIEW_CONFIG`. |
| `service-menu.css` / `service-menu.js` | The floating nav **pill** (chip-only, no grid toggle). |
| `viewer.html` | Generic markdown doc viewer (`?file=…&home=…`). |
| `project-template.html` | The thin shell to copy when spinning up a new subproject. |

## Iron rules

1. **Never copy or hand-write dashboard chrome in a subproject.** A subproject's
   `index.html` is the thin shell + a `PREVIEW_CONFIG` object — nothing else.
2. **No logo on the launcher.** Header is eyebrow + title only. (Studio rule.)
3. **Edit chrome only here.** A change to `launcher.*` / `service-menu.*`
   propagates to every subproject automatically (next load).
4. **Scope = Vsevolod.** Don't turn this into a global, cross-client kit.

## Spin up a new subproject dashboard (the whole drill)

1. Copy `project-template.html` → the new project's `index.html`.
2. Edit the **`PREVIEW_CONFIG`** object only:
   - `project` / `title`, the brand initial in the favicon,
   - `previews` (tiles), `docs`, `stages`, `meta`, `versions` (pill),
   - in `docs` + the brief link, replace `PROJECT-SLUG` with the GitHub Pages
     slug (e.g. `reply-anywhere`).
3. Add the actual preview pages (`wireframe/`, `uikit/`, …). On those content
   pages, load the pill from the base and set the legacy globals:
   ```html
   <link rel="stylesheet" href="https://chife-mod.github.io/sfg-dashboard/base/service-menu.css">
   <script>
     window.PREVIEW_PROJECT_NAME = "PROJECT NAME";
     window.PREVIEW_DEFAULT_VERSION = "wireframe";
     window.PREVIEW_VERSIONS = [ /* same list as PREVIEW_CONFIG.versions */ ];
   </script>
   <script defer src="https://chife-mod.github.io/sfg-dashboard/base/service-menu.js"></script>
   ```
4. Put project docs (e.g. `BRIEF.md`) at the project root — the shared viewer
   reads them same-origin.
5. Add a tile to the SF Group dashboard (`../index.html`, Prototypes section)
   using the same card template as the other tiles + a 1600×900 cover.

That's it — the dashboard itself is never authored again, only its config.

## Config reference

See `project-template.html` for the full annotated `PREVIEW_CONFIG` shape:
`project`, `eyebrow`, `title`, `previewsTitle`, `previews[]`, `docsTitle`,
`docs[]`, `stagesTitle`, `stages[]`, `meta[]`, `versions[]`.

- `previews[]`: `{ tag, title, desc, href, status?, cta? }` — `status:"planned"` dims it.
- `docs[]`: `{ label, sub, href, icon?, external? }` — `icon`: doc|globe|chat|repo|link.
- `stages[]`: `{ name, status, progress, label }` — `status`: done|active|pending.
- `meta[]`: `{ dt, dd }` or `{ dt, label, href }` for a link.
- `versions[]`: `{ id, label, desc, path }` — pill entries (preview pages only).

## First adopter

`reply-anywhere` (chife-mod/reply-anywhere) runs on this base — use its
`index.html` as a worked example.
