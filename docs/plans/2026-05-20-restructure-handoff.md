# Handoff — Vsevolod Restructure (на 2026-05-20)

> **Для нового агента:** этот файл — операционный snapshot работы по реструктуризации папки `/Users/oleg/Dev/vsevolod/`. Прочитай его сверху вниз, затем [PLAN.md](PLAN.md) для понимания решений и [`!sfg-dashboard!/docs/plans/2026-05-10-vsevolod-restructure-design.md`](!sfg-dashboard!/docs/plans/2026-05-10-vsevolod-restructure-design.md) для истории.

---

## Контекст в 30 секунд

Папка `/Users/oleg/Dev/vsevolod/` — клиентские артефакты SemanticForce Group (клиент: Vsevolod). 11 подпроектов с разнородными именами, два дубля одного отчёта (Sachet Weekly Pulse в `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse`).

**20 мая** Олег + Claude провели миграцию:
- Папки переименованы в lowercase kebab-case по таксономии `reports/` / `prototypes/` / `tools/` / `misc/`
- GitHub repo slugs **НЕ переименованы** (red-line — live URLs могли уйти клиентам, особенно Sachet)
- Дашборд `!sfg-dashboard!` переписан под двухуровневую навигацию с фильтрами

**Видение Vsevolod на будущее** (отдельный проект «каталог», не сейчас): brands × templates × platform × customer с поисковиком. Сейчас эти оси материализованы как теги в data-attributes карточек дашборда — «зацепки» под будущий каталог.

---

## ✅ Что сделано (зафиксировано в коммитах)

### Локально (file system state)

```
/Users/oleg/Dev/vsevolod/
├── !sfg-dashboard!/                          ← переписанный dashboard
├── PLAN.md                                   ← концептуальный план
├── HANDOFF.md                                ← этот файл
├── reports/
│   ├── green-reports/
│   │   ├── !templates!/{approved,sandbox}/   ← пустые placeholder с README
│   │   ├── watch-media/                      ← репо chife-mod/Watch360-PDF-Reports
│   │   └── weekly-pulse/sachet/              ← репо chife-mod/M360-jewelry-weekly-pulse
│   └── linkedin-remotion/
│       ├── !templates!/{approved,sandbox}/   ← пустые placeholder с README
│       ├── report-pdf/                       ← репо chife-mod/watch360-linkedin-pdf
│       └── report-remotion/                  ← репо chife-mod/watch360-remotion
├── prototypes/
│   ├── m360-signal-selector/                 ← репо chife-mod/M360_C
│   ├── wwg-2026-novelties-redesign/          ← репо chife-mod/wwg-2026-novelties-redesign
│   ├── business-school-command-center/       ← репо chife-mod/business-school-command-center
│   ├── manu-ai/                              ← репо chife-mod/manu-ai (ветка pivot-flatten-dashboard)
│   └── sf-ui-product-matching/               ← репо chife-mod/sf-ui-apm (репо ещё переименовать!)
├── tools/                                    ← пустая (Figma_To_PPT удалён пользователем)
└── misc/
    └── m360-sheets/                          ← без git
```

### Конкретные изменения

| Действие | Подробности |
|---|---|
| Backup | `/Users/oleg/MEGA/Vsevolod/vsevolod-backup-2026-05-20.tar.gz` (2.5 GB, без node_modules/dist). Синхронизируется в MEGA cloud — off-site копия. |
| `git push` M360 | коммит `f65924f deploy: rebalanced demand-detail columns` — финал heatmap для Sachet weekly-pulse |
| Очистка leaked PAT | `git remote set-url origin https://github.com/chife-mod/watch360-linkedin-pdf.git` в `reports/linkedin-remotion/report-pdf/.git/config` (был `gho_zgyvmbb...@github.com/...`) |
| Удаление legacy Sachet из Watch360-PDF-Reports | удалён `src/reports/weekly-pulse-draft.tsx` + убран из `src/reports/index.ts` (был DRAFT-snapshot 9 слайдов, финал лежит в M360 — 11 слайдов с heatmap). Изменения не закоммичены — см. ниже. |
| Cross-refs в manu-ai | `sf-ui-apm/` → `sf-ui-product-matching/` в `prototypes/manu-ai/{CLAUDE.md, PLAN.md, LOG.md, docs/BRIEF.md}`. Изменения не закоммичены (Олег обычно сам коммитит свою активную работу). |
| Дашборд переписан | `!sfg-dashboard!/index.html` — два коммита: `cefaee0` (rewrite) + `bb15ae1` (rename → sf-ui-product-matching). Оба запушены в `chife-mod/sfg-dashboard`. Live: https://chife-mod.github.io/sfg-dashboard/ |

### Что НЕ закоммичено локально (untracked / modified, не блокер)

| Репо | Состояние | Что делать |
|---|---|---|
| `reports/green-reports/watch-media/` (Watch360-PDF-Reports) | Modified: `src/reports/index.ts`, deleted `src/reports/weekly-pulse-draft.tsx` | Можно закоммитить как cleanup, или оставить — Олег сам закоммитит позже |
| `prototypes/manu-ai/` | Modified: LOG.md, PLAN.md, CLAUDE.md, docs/BRIEF.md, index.html. Untracked: design-v3/, design-v5/, design-v6/, docs/RESEARCH.md | Активная работа Олега + cross-ref правки — оставить как есть |
| остальные репо | разные мелочи (.preview/, .DS_Store, assets) | не критично, переедут как есть |

### Smoke-test live URLs (все возвращают 200)

```
https://chife-mod.github.io/sfg-dashboard/                  ← обновлённый dashboard
https://chife-mod.github.io/Watch360-PDF-Reports/           ← Watch Media
https://chife-mod.github.io/M360-jewelry-weekly-pulse/      ← Sachet weekly-pulse (финал)
https://chife-mod.github.io/watch360-linkedin-pdf/          ← LinkedIn PDF
https://chife-mod.github.io/Market360_Signal_Selector/      ← M360 Signal Selector
https://chife-mod.github.io/wwg-2026-novelties-redesign/    ← WWG Novelties
```

Миграция папок ни одного URL не сломала (репо-slugs не трогались).

---

## ✅ Update — 2026-05-20 vespere

Большая часть пунктов закрыта. Текущее состояние:

| Действие | Статус |
|---|---|
| Rename `sf-ui-apm` → `sf-ui-product-matching` | ✅ done (GitHub + local remote + dashboard карточка) |
| Монорепо для green-reports | ✅ done — `chife-mod/sfg-reports` (см. ниже) |
| TemplatesPage переезд из Watch Media | ✅ done — собственный артефакт `chife-mod/sfg-templates-viewer` |
| Все Sachet и Watch Media шаблоны в shared-каталоге | ✅ done — 24 layouts в `sfg-reports/shared/slides/` |
| Card covers Watch Media + Weekly Pulse | ✅ done — webp q=78, 17/18 KB |
| Удалить 3 GitHub репо (Tina_Karol_PPT, support-icon, Logo-Parser) | ⏳ ждёт `gh auth refresh -h github.com -s delete_repo` |
| Отзыв leaked PAT (`gho_zgyvmbb...`) в GitHub Settings | ⏳ ручное действие в GitHub UI |
| Auto-deploy Templates через GitHub Actions | ✅ настроен через SSH deploy key (ACTIONS_DEPLOY_KEY в sfg-reports + matching public key как deploy key на sfg-templates-viewer) |
| Internal vs Client view (`?view=client`) | ⏳ не делалось, отдельная задача |
| Watch Media и Sachet физически в монорепо | ⏳ намеренно отложено — incremental migration |

## 🆕 Что появилось — монорепо `chife-mod/sfg-reports` (private)

Принят **incremental migration** подход:
- Существующие Watch Media и Sachet отчёты **остаются в своих репо** (frozen — Sachet уже у клиента).
- Новый монорепо `sfg-reports` содержит:
  - `shared/` — single source of truth: 24 slide-компонента, ui, theme, data, assets
  - `apps/templates/` — отдельный Templates catalog viewer, деплоится на `chife-mod/sfg-templates-viewer`
  - `products/weekly-pulse/_template/` — скелет для нового клиента (Vulkan и т.п.)
  - `docs/how-to-add-client.md` + `docs/how-to-version-slide.md`
  - `.github/workflows/deploy-templates.yml` — auto-deploy при наличии PAT_DEPLOY

**Live URLs (все 200):**
- https://chife-mod.github.io/sfg-templates-viewer/ — общий Templates catalog
- https://chife-mod.github.io/sfg-dashboard/ — двухуровневый дашборд
- https://chife-mod.github.io/Watch360-PDF-Reports/ — frozen Watch Media
- https://chife-mod.github.io/M360-jewelry-weekly-pulse/ — frozen Sachet

**Архитектурные правила** (в `sfg-reports/docs/`):
- Косметика и optional props → правишь `shared/slides/X.tsx` in-place
- Variants → пропс `variant: 'a' | 'b'`
- Breaking change → файл-сосед `shared/slides/X.v2.tsx`; старые отчёты импортят v1
- Новый layout создаётся **сразу в `shared/slides/`**, не в клиентской папке
- Клиент-специфичное (logos, data) → `products/<type>/<client>/public/` и `src/data/`

**Workflow «новый клиент» (5 шагов, ~15 мин):**
1. `cp -r products/weekly-pulse/_template products/weekly-pulse/<client-slug>`
2. Replace data + public/logo.svg + REPORT_META
3. Add mode в `vite.config.ts` + scripts в `package.json`
4. `gh repo create chife-mod/sf-<client>-weekly-pulse --public` + добавить job в workflow
5. Зарегистрировать карточку на дашборде + option в Customer filter

## ⏳ Что осталось — Олег делает в UI / терминале

### 1. Удаление 3 устаревших репо
```bash
gh auth refresh -h github.com -s delete_repo
# затем агент в одну команду:
gh repo delete chife-mod/Tina_Karol_PPT --yes
gh repo delete chife-mod/support-icon --yes
gh repo delete chife-mod/Logo-Parser --yes
```
GH Pages у всех трёх уже отключены (404 на всех URL).

### 2. Отзыв leaked PAT
GitHub Settings → Developer settings → Personal access tokens → найти `gho_zgyvmbb...` → Revoke.

Это **единственное** что осталось не закрыто, и оба пункта требуют твоего действия.

## Отложено (не в текущем scope)

- **Internal vs Client view** (`?view=client` для скрытия toolbar/dropdown в client-shared URL)
- **Migrating frozen reports в монорепо** — Watch Media feb-2026 и Sachet apr-20-26 остаются в своих репо. Каждый **новый** выпуск пишется в `sfg-reports/products/<type>/<client>/`. Старые мигрировать когда понадобится их обновлять.

---

## 🗺️ Карта решений (для контекста)

| Решение | Зафиксировано в | Почему |
|---|---|---|
| Plural категории (`reports/`, `prototypes/`, ...) | PLAN.md | категория = контейнер множества |
| `!templates!/` (с восклицательными) | PLAN.md | сортируется в топ внутри template'а |
| Customer nesting nested (`weekly-pulse/sachet/`) | PLAN.md | type-first, customer внутри (Олег откатил customer-first 20 мая) |
| Repo slugs НЕ переименовываются (кроме sf-ui-apm) | PLAN.md | red-line: live URLs |
| `brands/` top-level папка НЕ создаётся | PLAN.md | это часть будущего каталога Vsevolod, не файловая структура |
| Двухуровневый дашборд | PLAN.md | масштабируется с ростом числа отчётов |
| Templates-плитка первая, вне фильтров | PLAN.md | каталог = вход в библиотеку |

---

## 📁 Критичные файлы для чтения новым агентом

1. **[PLAN.md](PLAN.md)** — концептуальный план (целевая структура, решения, что почему)
2. **[`!sfg-dashboard!/docs/plans/2026-05-10-vsevolod-restructure-design.md`](!sfg-dashboard!/docs/plans/2026-05-10-vsevolod-restructure-design.md)** — design-doc 10 мая (предыстория, отвергнутые варианты)
3. **[`!sfg-dashboard!/docs/plans/_archive/2026-05-05-monorepo-migration.md`](!sfg-dashboard!/docs/plans/_archive/2026-05-05-monorepo-migration.md)** — план монорепо (24 task'а, для будущей сессии)
4. **[`!sfg-dashboard!/CLAUDE.md`](!sfg-dashboard!/CLAUDE.md)** — память дашборд-репо (содержит ИСХОДНЫЕ инструкции до миграции — частично устарела, при работе с дашбордом обновить под новый двухуровневый layout)
5. **[`!sfg-dashboard!/index.html`](!sfg-dashboard!/index.html)** — текущий дашборд (читать чтобы понять структуру тегов, фильтров, router)

---

## ⚠️ Что НЕ ломать

1. **Live GH Pages URLs** — `Watch360-PDF-Reports`, `M360-jewelry-weekly-pulse`, `watch360-linkedin-pdf`, `Market360_Signal_Selector`, `wwg-2026-novelties-redesign`. Особенно critical для Sachet (`M360-jewelry-weekly-pulse`) — ссылка ушла клиенту.
2. **`prototypes/manu-ai/` на ветке `pivot-flatten-dashboard`** — активная работа Олега. Не мерджить в main без согласования.
3. **`!sfg-dashboard!/docs/plans/_archive/`** — исторические планы, читать но не редактировать.

## 🎯 Vsevolod-овский «каталог» (отдельный долгосрочный проект)

Не делать сейчас. Vsevolod видит итоговую структуру по 4 осям:
- **Brand** — SemanticForce, Watch360, Market360, Pharma360, white-label партнёры
- **Template** — SoMe Insights, WWG Novelties, DACH SPORT KOLs, LinkedIn Novelties и т.д. (~20+ шаблонов)
- **Platform** — на базе какого SF-продукта делается
- **Customer/Lead** — Sachet, Vulkan, Roshen, Abbott, …

Каталог-проект — отдельная сессия с Иваном и Юлей (день+ работы по словам самого Vsevolod). Сейчас все 4 оси уже доступны как теги в data-attributes карточек дашборда — фильтры работают, и каталог можно строить поверх без перестройки папок.
