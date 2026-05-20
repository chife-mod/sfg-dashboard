# Vulcain Monthly Pulse — Apr 2026

> **Status: 🟡 IN PROGRESS — 2026-05-20 vespere.**
>
> **Цель:** первый клиентский отчёт через новый workflow монорепо `sfg-reports`. Подтверждает что «новый клиент = 15 минут» — это реальность, а не теория.

---

## Client brief (verbatim from Олег)

```
Base template (Sacet): URL
Client website:    https://vulcain.ch/
Instagram:         https://www.instagram.com/vulcain_watches/

S1: Sacet -> Vulcain // https://vulcain.ch/
    Monthly Pulse [Apr 01 - Apr 30 2026]
    URL [All Slides] - watch360.ai
S2: Sacet -> Vulcain
S3: Competitor SoMe Insights
S4: Vulcain Boutique Reviews
S5: Competitor Boutique Reviews
S6: Sacet -> Vulcain
S7: Vulcain in Watch Media
    Total Articles: 17 / 3
    TOP-10 Sources
    TOP-10 Countries
S8: Vulcain in Media
S9: Vulcain by Watch Influencers
```

**Figma source for cover design:** `V8XA0PVaAjxvPbq24stJXk`, node `170-3282`
https://www.figma.com/design/V8XA0PVaAjxvPbq24stJXk/Watch360-PDF-Reports?node-id=170-3282

---

## Slide → shared template mapping

| Slide | Layout from `shared/slides/` | Notes |
|---|---|---|
| S1 — Cover | `CoverMonthlyPulse` (new, see below) | Title, period, brand logo — pulled 1:1 from Figma node `170-3282` |
| S2 — Section cover · Sachet → Vulcain | `SectionCoverSlide` | Section header before SoMe + Reviews block |
| S3 — Competitor SoMe Insights | `SacetSoMeInsightsSlideV2` | `title="Competitor Social Media Insights"`. Если client mock posts нет — placeholders из Sacet |
| S4 — Vulcain Boutique Reviews | `BoutiqueReviewsSlide` | `title="Vulcain Boutique Reviews"`, реальные если бриф их даст, иначе Sacet placeholder |
| S5 — Competitor Boutique Reviews | `BoutiqueReviewsSlide` | `title="Competitor Boutique Reviews"`, placeholder из Sacet (Gemmyo) |
| S6 — Section cover · Sachet → Vulcain | `SectionCoverSlide` | Section header before Watch Media block |
| S7 — Vulcain in Watch Media | `OverviewSlide` или composite (`TopSourcesSlide` + `TopCountriesSlide`) | Total Articles 17/3, TOP-10 Sources, TOP-10 Countries. Возможно `OverviewSlide` для metrics + два separate slides для TOPs — пересмотреть когда увидим Figma |
| S8 — Vulcain in Media | `TopSourcesSlide` или подобный | Media coverage breakdown |
| S9 — Vulcain by Watch Influencers | TBD — может новый layout если нет existing fit | Influencer-specific layout — возможно создаём как новый `shared/slides/InfluencersSlide.tsx` если ничего не подходит |

**Принцип-якорь:** все layouts импортируются из `@shared/slides/...`. Никаких локальных копий компонентов в папке клиента. Только data + assets — Vulcain-specific.

---

## Cover design — extraction from Figma

S1 Cover нужен monthly не weekly (у нас в shared есть `CoverWeeklyPulse`). Подходы — в порядке предпочтения:

1. **Variant prop**: если `CoverWeeklyPulse` уже принимает `title` пропс — передаём `title="Monthly Pulse"` и готово. Косметика, in-place правка `shared/slides/CoverWeeklyPulse.tsx` если нужно сделать заголовок prop-driven.
2. **Sibling file**: если структурно другой layout (например другая композиция элементов) — создаём `shared/slides/CoverMonthlyPulse.tsx` отдельным файлом. Sachet продолжает импортить `CoverWeeklyPulse`, Vulcain импортит `CoverMonthlyPulse`.

**Figma steps (через Figma MCP):**
1. `get_metadata` на node `170-3282` — узнаём что это (frame? component?), какие children
2. `get_design_context` — реальная структура: текст «Monthly Pulse», даты, brand logo placement
3. `get_screenshot` (если frame малый, чтобы не убить session) — визуальный референс
4. Export brand logo:
   - Если в Figma это vector (frame/group of vectors) → экспорт **SVG** через `download_assets` или подобный MCP метод, кладём в `products/monthly-pulse/vulcain/public/vulcain-logo.svg`
   - Если raster (image fill) → экспорт **PNG @2x**, тот же путь но `.png`
5. Cover-компонент принимает `logo` пропс — Vulcain отчёт передаёт свой `vulcain-logo.svg`.

---

## Repo + dir layout

```
sfg-reports/
└── products/
    └── monthly-pulse/                   ← NEW type (parallel to weekly-pulse/)
        ├── _template/                   ← (TODO: clone weekly-pulse/_template)
        └── vulcain/                     ← THIS REPORT
            ├── index.html
            ├── public/
            │   ├── vulcain-logo.svg     ← from Figma
            │   └── favicon.svg
            ├── docs/
            │   └── brief.md             ← client brief (verbatim, см. выше)
            └── src/
                ├── main.tsx
                ├── App.tsx              ← imports `apr-2026.tsx`
                ├── index.css
                ├── data/                ← Vulcain-specific data (when provided)
                │   ├── some-posts.ts
                │   ├── reviews.ts
                │   ├── media.ts
                │   └── ...
                └── reports/
                    └── apr-2026.tsx     ← deck assembled from @shared/slides
```

---

## Execution checklist

### Phase A — Scaffold (10 мин)
- [ ] Создать `products/monthly-pulse/_template/` (клон `weekly-pulse/_template/`)
- [ ] `cp -r products/monthly-pulse/_template products/monthly-pulse/vulcain`
- [ ] Положить `docs/brief.md` (verbatim бриф)
- [ ] Обновить `REPORT_META`, title, favicon placeholder
- [ ] Добавить `vulcain` mode в `vite.config.ts` (`base: '/sf-vulcain-monthly-pulse/'`)
- [ ] Добавить scripts `dev:vulcain` / `build:vulcain` в `package.json`
- [ ] `npm run dev:vulcain` — пустой scaffold рендерится локально

### Phase B — Cover from Figma (15 мин)
- [ ] Figma MCP: `get_metadata` node `170-3282`
- [ ] Если layout reusable → расширить `CoverWeeklyPulse` пропсами `title`/`period`/`logo`/`logoType` через optional defaults (Sachet продолжает рендериться identically)
- [ ] Иначе создать `shared/slides/CoverMonthlyPulse.tsx`
- [ ] Export Vulcain brand logo из Figma (SVG если вектор, PNG @2x если растр) → `vulcain/public/vulcain-logo.svg`
- [ ] Wire cover в `apr-2026.tsx` с правильными props
- [ ] Verify локально

### Phase C — Slides S2-S9 (45 мин)
- [ ] S2/S6 — `SectionCoverSlide` с subtitle «Sachet → Vulcain»
- [ ] S3 — `SacetSoMeInsightsSlideV2` (Competitor SoMe, Sachet-mock posts если нет client mock)
- [ ] S4 — `BoutiqueReviewsSlide` (Vulcain reviews / Sachet placeholder)
- [ ] S5 — `BoutiqueReviewsSlide` (Competitor)
- [ ] S7 — Composite slide: `OverviewSlide` (Total Articles 17/3) + `TopSourcesSlide` + `TopCountriesSlide`, или один comprehensive layout — пересмотрим когда увидим Figma frame
- [ ] S8 — `TopSourcesSlide` (или подобное)
- [ ] S9 — Если нет fit среди shared/slides → создать `shared/slides/InfluencersSlide.tsx` (или v.2 чего-нибудь подходящего)

### Phase D — Register everywhere (10 мин)
- [ ] `gh repo create chife-mod/sf-vulcain-monthly-pulse --public`
- [ ] Generate new SSH deploy key для этого target
  - Public key → deploy key на sf-vulcain-monthly-pulse (write)
  - Private key → secret `DEPLOY_KEY_VULCAIN` в sfg-reports
- [ ] Добавить job в `.github/workflows/deploy-templates.yml` (или новый `deploy-vulcain.yml`)
- [ ] Dashboard `!sfg-dashboard!/index.html`:
  - Карточка `Vulcain · Monthly Pulse · Apr 2026` в Green Reports разделе
  - `data-customer="vulcain"`, `data-type="monthly-pulse"`, `data-platform="watch360"`, `data-brand="watch360"` (или semanticforce — уточним)
  - `<option value="vulcain">vulcain</option>` в Customer filter
  - Cover image — экспорт из локального build или вручную сделанный screenshot

### Phase E — Publish + verify (5 мин)
- [ ] Push в `sfg-reports/main`
- [ ] Workflow собирает + деплоит → https://chife-mod.github.io/sf-vulcain-monthly-pulse/
- [ ] Smoke test: live URL 200
- [ ] Dashboard карточка кликается, ведёт на новый URL

---

## Open questions

- **Тип `monthly-pulse` vs клон `weekly-pulse`?** Контент почти тот же, но cadence другая. Создаю **отдельный type** `monthly-pulse` чтобы фильтры на дашборде различали. Если потом окажется что слайды идентичны — можно слить.
- **Brand/platform для Vulcain?** В брифе только client website. Возможно `brand="watch360"` (раз отчёт на base watch360.ai), `platform="watch360"`. Уточним если значимо.
- **S9 Influencers** — есть ли layout среди shared/slides? Если нет — это первый template созданный «прямо в shared», подтверждающий правило «новые layouts сразу в shared, не в client folder».

---

## Versioning notes (для shared/slides changes)

Если по ходу выяснится что какой-то layout надо изменить ради Vulcain:

- **Косметика** (опциональные новые пропсы с default-значениями) → правка `shared/slides/X.tsx` in-place. Sachet продолжает работать благодаря optional props.
- **Breaking change** (новый required prop, другая data shape) → создаём `shared/slides/X.v2.tsx` сосед. Sachet импортит `X`, Vulcain — `X.v2`.

См. [`sfg-reports/docs/how-to-version-slide.md`](https://github.com/chife-mod/sfg-reports/blob/main/docs/how-to-version-slide.md).
