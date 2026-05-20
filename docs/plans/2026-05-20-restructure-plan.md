# Vsevolod — Restructure Decision (2026-05-20)

> ## ✅ Status: SUBSTANTIALLY DONE
>
> **Сделано (2026-05-20 вечер):**
> - ✅ Backup `~/vsevolod-backup-2026-05-20.tar.gz` (2.5 GB)
> - ✅ M360 unpushed коммит запушен на GitHub
> - ✅ Leaked PAT вычищен из local remote (PAT в GitHub Settings — Олег отозвать)
> - ✅ Legacy `weekly-pulse-draft.tsx` удалён из Watch360-PDF-Reports
> - ✅ Все папки переехали в целевую структуру:
>     - `reports/green-reports/watch-media/` (из Watch360 PDF Reports)
>     - `reports/green-reports/weekly-pulse/sachet/` (из M360-jewelry-weekly-pulse)
>     - `reports/green-reports/!templates!/{approved,sandbox}/` (placeholder с README)
>     - `reports/linkedin-remotion/{report-pdf,report-remotion,!templates!/}` (из Watch360_LinkedIn...)
>     - `prototypes/{m360-signal-selector,wwg-2026-novelties-redesign,business-school-command-center,manu-ai,sf-ui-product-matching}/`
>     - `misc/m360-sheets/`
> - ✅ Cross-refs обновлены в `prototypes/manu-ai/{CLAUDE.md,PLAN.md,LOG.md,docs/BRIEF.md}` (sf-ui-apm → sf-ui-product-matching)
> - ✅ Дашборд `!sfg-dashboard!/index.html` полностью переписан — двухуровневая навигация, фильтры (customer/type/platform/brand), info-footer на карточках (GitHub + локальная папка). Commit cefaee0 запушен.
> - ✅ Все 6 live GH Pages URLs возвращают 200 (миграция папок ничего не сломала)
>
> **Осталось — требует `gh auth refresh -h github.com -s delete_repo` от Олега:**
> - ⏳ Удалить репо: `chife-mod/Tina_Karol_PPT`, `chife-mod/support-icon`, `chife-mod/Logo-Parser`
> - ⏳ Переименовать репо: `chife-mod/sf-ui-apm` → `chife-mod/sf-ui-product-matching` + обновить local remote
> - ⏳ Figma_To_PPT локально удалён Олегом, репо на GitHub удалить
>
> **Не сделано — отложено (большая работа, отдельная сессия):**
> - 📋 Слияние Watch Media + Sacet в один монорепо `chife-mod/sf-reports` с extract'ом `!templates!/`, multi-entry Vite, cross-repo deploy через GitHub Actions. Сейчас два отчёта живут как два независимых git-репо в правильных папках — функционально работает идентично прежнему, но `!templates!/` пока пустой (с README-заглушкой).
>
> Полный план миграции монорепо лежит в `!sfg-dashboard!/docs/plans/_archive/2026-05-05-monorepo-migration.md` (24 task'а) — будет рабочим документом следующей сессии.

---


## Что делаем

Раскладываем все проекты по 4 категориям. Локальные папки переименовываем — GitHub-репо НЕ трогаем (URLs могли уйти клиентам).

## Целевая структура

```
vsevolod/
├── !sfg-dashboard!/                          ← остаётся как есть
├── reports/
│   ├── green-reports/                        ← горизонтальный PDF
│   │   ├── !templates!/                      ← каталог шаблонов (TemplatesPage + slides) — sort to top
│   │   │   ├── approved/                     ← утверждённые переиспользуемые слайды (production)
│   │   │   └── sandbox/                      ← экспериментальные варианты (из Watch360 PDF Reports/sandbox.tsx)
│   │   ├── watch-media/                      ← TYPE (SF-internal, из Watch360 PDF Reports — только Watch Media отчёты)
│   │   └── weekly-pulse/                     ← TYPE (из M360-jewelry-weekly-pulse)
│   │       └── sachet/                       ← CUSTOMER (apr-20-26.tsx, apr-27.tsx, …)
│   └── linkedin-remotion/                    ← вертикальный PDF + видео
│       ├── !templates!/
│       │   ├── approved/
│       │   └── sandbox/
│       ├── report-pdf/                       ← из Watch360_LinkedIn.../report-pdf
│       └── report-remotion/                  ← из Watch360_LinkedIn.../report-remotion
├── prototypes/
│   ├── m360-signal-selector/                 ← из Market360_Signal_Selector
│   ├── wwg-2026-novelties-redesign/          ← из WWG 2026 Novelties Page Redesign
│   ├── business-school-command-center/
│   ├── manu-ai/
│   └── sf-ui-product-matching/
├── tools/                                    ← пустая пока (Figma_To_PPT удалён 20 мая)
└── misc/
    └── m360-sheets/                          ← из Market 360 Google Sheets
```

## Навигация дашборда (двухуровневая)

**Уровень 1 — главный экран `!sfg-dashboard!/index.html`** — плитки категорий:
- Green Reports
- LinkedIn Remotion
- Prototypes
- Tools
- Misc

**Уровень 2 — под-экран категории** (например `green-reports.html` или `#/green-reports`):
- Список карточек отчётов
- **Фильтры сверху**: `customer`, `type`, `platform`, `brand` (используют data-attributes карточек)
- Пилл "Templates" как отдельная плитка-сосед (ведёт на каталог шаблонов + sandbox)

Пример Green Reports второго уровня:

```
[Filters:  customer ▼  · type ▼  · platform ▼  · brand ▼ ]

Карточки (по порядку):
├── 1. Templates                       ← ВСЕГДА ПЕРВАЯ (каталог shared-шаблонов + sandbox)
├── 2. Watch Media · Feb 2026          (type=watch-media, platform=watch360)
├── 3. Watch Media · Apr 2026          (type=watch-media, platform=watch360)
├── 4. Weekly Pulse · Sacet · Apr 20-26   (type=weekly-pulse, customer=sachet, platform=market360, brand=semanticforce)
├── 5. Weekly Pulse · Sacet · Apr 27       (то же)
└── …
```

Templates-плитка не фильтруется (она вне data-фильтров) — это «вход» в библиотеку, всегда видна.

**Подвал плитки** (info-плашка для разработчика — на каждой карточке снизу):
- 🔗 Ссылка на GitHub-репо (например `chife-mod/sf-reports`)
- 📁 Локальная рабочая папка (например `vsevolod/reports/green-reports/weekly-pulse/sachet/`)
- ℹ️ Кнопка info → попап с расширенной инфой (deploy URL, basePath, ветка)

Каждая плитка отчёта имеет два режима:
- **Internal preview** (для команды) — с dropdown, переключателем выпусков, ссылками наружу
- **Client share** — query-param `?view=client`, без UI-обвязки, чисто слайды

## Теги карточек дашборда

Каждая карточка отчёта в `!sfg-dashboard!/index.html` получает data-attributes — это «зацепки» под будущий каталог Vsevolod (фильтры по бренду / платформе / клиенту), которые не требуют перестройки папок.

```html
<a class="card"
   data-brand="semanticforce"          ← под каким SF-лого/доменом отправлено клиенту
   data-platform="market360"           ← на базе какого внутреннего продукта сделано
   data-template="green-reports"       ← визуальный шаблон
   data-format="horizontal-pdf"        ← формат
   data-type="weekly-pulse"            ← тип отчёта
   data-customer="sachet">             ← конечный клиент
   ...
</a>
```

**Пример для Sachet Weekly Pulse:** brand=`semanticforce`, platform=`market360`, customer=`sachet`, type=`weekly-pulse`, template=`green-reports`, format=`horizontal-pdf`.

Закрытые списки (контролируются через дашборд):
- `brand`: `semanticforce` · `watch360` · `market360` · `pharma360` · `<partner-slug>`
- `platform`: `semanticforce` · `watch360` · `market360` · `pharma360`
- `template`: `green-reports` · `linkedin-remotion` · (будущие)
- `format`: `horizontal-pdf` · `vertical-pdf` · `vertical-video`
- `type`: `weekly-pulse` · `monthly-pulse` · `watch-media` · `kols` · `novelties` · …

Открытые: `customer` (любой slug).

## Правило накопления `!templates!/`

Внутри каждого template'а (`green-reports/`, `linkedin-remotion/`) папка `!templates!/` — **общая библиотека переиспользуемых слайдов** для всех отчётов этого формата.

**Когда в отчёте (например, `weekly-pulse/sachet/apr-20-26.tsx`) появляется новый слайд:**
1. Если он одноразовый/customer-specific → остаётся в файле отчёта.
2. Если он переиспользуем (новый тип таблицы, новая карта, новый chart) → **переносим в `!templates!/`**, документируем в каталоге (category + description), отчёт импортирует его оттуда.

**Каталог-вьювер** — существующий `TemplatesPage.tsx` (страница Templates с фильтрами Cover/Overview/Table/Models/Keyword/Quote/Map). При миграции переезжает в `green-reports/!templates!/` и обслуживает оба type'а (watch-media + weekly-pulse).

## Решения

| Что | Решение |
|---|---|
| Корневые папки | `reports/`, `prototypes/`, `tools/`, `misc/`, `!sfg-dashboard!/` |
| Naming | lowercase kebab-case |
| GitHub repo slugs | НЕ переименовываем (red-line: live URLs) |
| Исключения | `Tina_Karol_PPT` → `figma-to-ppt`, `sf-ui-apm` → `sf-ui-product-matching` (нет live URLs) |
| GH-only репо `support-icon`, `Logo-Parser` | удалить оба |
| Leaked PAT в `report-pdf/.git/config` | отозвать в GitHub Settings, очистить remote |
| Vsevolod-овский top-level `brands/` + `templates/` | НЕ сейчас — отдельная сессия с Иваном/Юлей |
| Legacy Sachet в `Watch360-PDF-Reports` | удалить `src/reports/weekly-pulse-draft.tsx` + убрать из `index.ts` (Sachet живёт только в M360) |
| `Watch360-PDF-Reports/src/reports/sandbox.tsx` | перенести в `!templates!/sandbox/` (рядом с approved) |
| `Watch360-PDF-Reports/src/app/TemplatesPage.tsx` | переносим в `!templates!/` как viewer; обслуживает approved + sandbox |
| Internal vs Client view | один бандл, query-param `?view=client` скрывает toolbar/dropdown/ссылки наружу |

## Pre-flight (Олег делает перед стартом)

1. Push всех изменений во всех 9 git-репо.
2. `tar -czf ~/vsevolod-backup-2026-05-20.tar.gz /Users/oleg/Dev/vsevolod/`
3. Отозвать leaked PAT (`[expired token]`) в GitHub Settings → Tokens.

## Migration — одной сессией, всё за раз

**Cleanup:**
1. Вычистить leaked PAT из remote `Watch360_LinkedIn_PDF_animations_remotion/report-pdf` (`git remote set-url`).
2. `gh repo delete chife-mod/support-icon` + `chife-mod/Logo-Parser`.
3. `gh repo rename`: `Tina_Karol_PPT` → `figma-to-ppt`, `sf-ui-apm` → `sf-ui-product-matching`. Обновить remote локально.
4. В `Watch360-PDF-Reports`: удалить `src/reports/weekly-pulse-draft.tsx` + убрать из `index.ts` (Sachet legacy дублёр). Вынуть `sandbox.tsx` и `app/TemplatesPage.tsx` для последующего переноса в `!templates!/`.

**Создание монорепо `chife-mod/sf-reports` (объединение Watch Media + Sachet):**
5. `gh repo create chife-mod/sf-reports --private` + локально `reports/green-reports/` инициализировать как git-репо этого slug'а.
6. Скопировать `package.json`, `tsconfig*`, `tailwind.config.ts`, `vite.config.ts` из `M360-jewelry-weekly-pulse` как baseline.
7. Создать `!templates!/approved/` (extracted shared slides: Cover, Overview, Table, Models, Keyword, Quote, Map — те 15 из TemplatesPage), `!templates!/sandbox/` (из старого sandbox.tsx), `!templates!/TemplatesPage.tsx` как viewer.
8. Перенести Watch Media отчёты в `green-reports/watch-media/` (без своего .git), импорты → `@templates/...`.
9. Перенести Sachet отчёты в `green-reports/weekly-pulse/sachet/` (без своего .git), импорты → `@templates/...`.
10. Vite multi-entry config: `watch-media`, `sachet`, `templates` (3 build entry).
11. GitHub Actions workflow `.github/workflows/deploy.yml` с `peaceiris/actions-gh-pages` + `external_repository`:
    - Build `watch-media` → push в `chife-mod/Watch360-PDF-Reports@gh-pages`
    - Build `sachet` → push в `chife-mod/M360-jewelry-weekly-pulse@gh-pages`
    - Build `templates` → push в `chife-mod/Watch360-PDF-Reports@gh-pages/templates/` (или отдельный путь)
12. Создать PAT_DEPLOY secret (Олег создаёт fine-grained PAT с правами `repo` на оба deploy-target репо).
13. Старые папки `Watch360 PDF Reports/` и `M360-jewelry-weekly-pulse/` удалить (контент уже в sf-reports). Их репо на GitHub остаются как deploy-targets — README обновить «source moved to chife-mod/sf-reports».

**Остальная миграция папок:**
14. `mv "Watch360_LinkedIn_PDF_animations_remotion/report-pdf" reports/linkedin-remotion/report-pdf`.
15. `mv "Watch360_LinkedIn_PDF_animations_remotion/report-remotion" reports/linkedin-remotion/report-remotion`.
16. Создать `reports/linkedin-remotion/!templates!/approved/` и `!templates!/sandbox/` (пустые seed для будущих переиспользований).
17. `mv` папок в `prototypes/`:
    - `Market360_Signal_Selector` → `prototypes/m360-signal-selector`
    - `WWG 2026 Novelties Page Redesign` → `prototypes/wwg-2026-novelties-redesign`
    - `business-school-command-center` → `prototypes/`
    - `manu-ai` → `prototypes/`
    - `sf-ui-apm` → `prototypes/sf-ui-product-matching`
18. `mv "Figma_To_PPT" tools/figma-to-ppt`.
19. `mv "Market 360 Google Sheets" misc/m360-sheets`.

**Cross-references:**
20. `manu-ai/CLAUDE.md` + `README.md`: `vsevolod/sf-ui-apm` → `vsevolod/prototypes/sf-ui-product-matching`.
21. `!sfg-dashboard!/index.html`: переписать под двухуровневый layout, добавить data-attributes (`brand`, `platform`, `template`, `format`, `type`, `customer`), добавить query-param `?view=client` логику для отчётов, удалить карточки support-icon + Logo Parser, обновить локальные пути.
22. `!sfg-dashboard!/CLAUDE.md`: обновить таблицу путей и проектов.
23. Создать `!sfg-dashboard!/green-reports.html` (или fragment-роут) — второй уровень дашборда с фильтрами + плиткой Templates первой.

**Verification:**
24. Smoke-test live URLs (должны открываться идентично прежнему):
    - `https://chife-mod.github.io/Watch360-PDF-Reports/` (Watch Media)
    - `https://chife-mod.github.io/M360-jewelry-weekly-pulse/` (Sachet)
    - `https://chife-mod.github.io/watch360-linkedin-pdf/`
    - `https://chife-mod.github.io/Market360_Signal_Selector/`
    - `https://chife-mod.github.io/wwg-2026-novelties-redesign/`
    - `https://chife-mod.github.io/sfg-dashboard/` (обновлённый)
25. Локальный smoke-test: `npm run dev:watch-media`, `npm run dev:sachet`, `npm run dev:templates` в sf-reports. `npm run dev` в каждом prototype.
26. Commit + push в `sf-reports`, в `!sfg-dashboard!`, в `manu-ai` (если CLAUDE/README обновлены).

**Длительность:** реалистично ~день работы (объединение монорепо + cross-repo deploy + smoke-test + двухуровневый дашборд — это не час).

## Что не ломается

- GH Pages URLs (репо не переименовываем).
- Git history (mv папки на ОС не трогает .git).
- Vite/Next basePath в каждом репо.

## Что меняется

- Локальные пути в дашборде (`!sfg-dashboard!/index.html` + `CLAUDE.md`).
- Cross-ссылки `manu-ai` → `sf-ui-product-matching` (manu-ai/CLAUDE.md + README.md).
- Remote URLs у `figma-to-ppt` и `sf-ui-product-matching` (два переименованных репо).
