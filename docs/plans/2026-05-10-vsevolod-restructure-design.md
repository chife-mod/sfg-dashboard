# Vsevolod folder & SFG Dashboard — Restructure Design

> **Status: 🟡 PAUSED — продолжаем во вторник 2026-05-12 после созвона с клиентом (Vsevolod).**
>
> На следующий запуск Claude: прочитай этот документ сверху вниз, потом загляни в [`_archive/2026-05-05-monorepo-migration.md`](./_archive/2026-05-05-monorepo-migration.md) — там детальный план миграции с source mapping, Vite multi-entry конфигом и cross-repo deploy strategy. Всё это нам пригодится в фазе имплементации.

---

## TL;DR

Переорганизуем папку `/Users/oleg/Dev/Vsevolod/` по типам проектов (`reports/`, `prototype/`, `tools/`), переименуем все папки и репозитории в lowercase kebab-case, настроим переиспользование шаблонов внутри отчётов через `shared-templates/` папки. SFG Dashboard остаётся лёгким HTML-индексом со ссылками — не контейнером.

---

## Контекст

- **5 мая 2026** — Олег + Claude обсудили монорепо `sf-reports` для объединения W360-PDF-Reports + M360-jewelry-weekly-pulse. Записали [`_archive/2026-05-05-monorepo-migration.md`](./_archive/2026-05-05-monorepo-migration.md) (24-task план), создали `sf-reports/` папку, дальше не пошли.
- **После 5 мая** — клиент (Vsevolod) прислал письмо с структурным видением (типы / template / customer / lead). Это видение продолжает идею 5 мая, но расширяет её на ВСЕ проекты, не только отчёты.
- **10 мая 2026** — Олег + Claude по этому письму провели брейншторм, пришли к финальной таксономии (см. ниже).
- **Дальше** — во вторник 12 мая созвон Олег ↔ Vsevolod, после которого решения финализируются и стартует имплементация.

---

## Финальная таксономия (договорённость 10 мая)

### Типы проектов (главный фильтр дашборда)

| Тип | Что это | Текущие проекты |
|---|---|---|
| **report** | статический деливерабл клиенту (PDF, slides, sheet) | W360 PDF Reports, M360 Jewelry Weekly Pulse, W360 LinkedIn |
| **prototype** | концепт страницы / лендинг / интерактивная демка / UI-компонент | WWG Novelties, M360 Signal Selector, SF UI Support Icon |
| **tool** | утилита для команды SF (автоматизация) | Figma → PPT |
| **misc** | разное (Google Sheets и т.п.) | M360 Sheets |

### Теги (вторичные фильтры)

```
platform : sf | sfg | w360 | m360 | sacet         ← закрытый список (внутренние SF продукты)
customer : <open list>                              ← внешний лид/клиент (опционально)
```

### Иерархия отчётов (3 уровня)

```
reports/
└── <template>/                  ← визуальный шаблон (e.g. green-report)
    ├── shared-templates/        ←   общие компоненты этого template'а: CoverSlide, theme, ui
    └── <type>/                  ← тип отчёта (e.g. weekly-pulse, watch-media)
        └── <client>/            ← клиент (только если внешний; если SF-внутренний — без обёртки)
```

### Отвергнутые опции

| Что отвергли | Почему |
|---|---|
| Один большой монорепо `sfg-dashboard/` со всем внутри | Усложнение, потеря git-историй, не нужно — дашборд это лёгкий индекс ссылок |
| Шеринг через `git submodule` / `npm package` | Overkill для нашего размера (см. discussion log в архивном плане) |
| `format: vertical | horizontal` ось | Избыточно — формат вытекает из template'а |
| `product` ось | Избыточно — название отчёта само себя описывает |
| `customer = karol` (Tina Karol) | Удалили — `tina-karol-ppt` репо merge'аем в `figma-to-ppt` (это tool) |
| Отдельный `sf-reports/` монорепо как обёртка | Растворили — структура живёт прямо в `Vsevolod/reports/` |

---

## Целевая структура файловой системы (предложение Vsevolod, скриншот 10 мая)

```
Vsevolod/                                 ← корень (имя клиента)
│
├── !sfg-dashboard!/                      ← ЛЁГКИЙ HTML-индекс с ссылками куда угодно
│                                            (восклицательные знаки сортируют его в топ)
│
├── prototype/                            ← (?) singular — см. open question
│   ├── m360-signal-selector/
│   └── wwg-26-novelties-redesign/        ← (?) wwg-26 vs wwg-2026 — см. open question
│
├── reports/
│   └── green-report/                     ← (?) singular — см. open question
│       ├── shared-templates/             ← переиспользуемые компоненты этого template'а
│       ├── watch-media/                  ← W360 по умолчанию (без клиентской обёртки)
│       └── weekly-pulse/
│           └── sacet/                    ← внешний клиент → нужна обёртка
│
└── tools/
    └── figma-to-ppt/
```

### Что в этой структуре отсутствует / неясно

- **`misc/`** — нет на скриншоте, но `m360-sheets` куда-то нужно положить
- **`sf-ui-support-icon`** — пока только GH-репо, локально нет; пойдёт в `prototype/` когда заведём
- **`linkedin-remotion`** — обсуждали как второй template/category в `reports/` но на скриншоте нет; W360 LinkedIn PDF + Remotion живёт отдельным шаблоном
- **`shared/` на уровне корня `reports/`** — для глобальных компонентов между разными templates (если понадобится)

---

## Мои замечания по предложенной структуре *(на обсуждение во вторник)*

### 1. Plural / singular непоследовательность

В скриншоте: `prototype` (sing), `reports` (plural), `tools` (plural), `green-report` (sing). Конвенция — plural для категорий-контейнеров. Предлагаю: **все плюрализовать** → `prototypes/`, `reports/`, `tools/`, `green-reports/`. Или все singular — но это нетипично.

### 2. Имя shared-папки

`shared-templates/` — длинно. Альтернативы: `shared/`, `_shared/` *(подчёркивание сортирует в топ)*, `templates/`. Рекомендую **`_shared/`** для consistency с архивным sf-reports планом и сортировкой.

### 3. `wwg-26` vs `wwg-2026`

Сокращение года в slug может запутать через 5-10 лет. Рекомендую полную форму: **`wwg-2026-novelties-redesign`** (она же уже на GH Pages).

### 4. Куда `misc/`

Если оставить без него — `m360-sheets` падает в `tools/`? Лучше явный **`misc/`** для не-кода (Google Docs / Sheets / внешние ссылки).

### 5. `linkedin-remotion` и второй template

Если W360 LinkedIn PDF использует **другой** визуальный шаблон (вертикальный + видео), он живёт как **второй template** в `reports/`:
```
reports/
├── green-reports/        ← horizontal cover, для weekly-pulse + watch-media
│   ├── _shared/
│   ├── watch-media/
│   └── weekly-pulse/sacet/
└── linkedin-remotion/    ← vertical + video, для LinkedIn-карусели
    ├── _shared/
    └── (W360 by default)
```

### 6. Где живёт корневой `_shared/` (между templates)

Если когда-нибудь компонент нужен и в `green-reports/`, и в `linkedin-remotion/` — нужен `reports/_shared/`. Пока проектируем: пустой / отсутствует, добавим когда возникнет реальная нужда.

---

## Таблица переименований (актуальна на 10 мая)

| Текущая папка / репо | Новый путь в `Vsevolod/` | Локальная ссылка | Type |
|---|---|---|---|
| `!SFG Dashboard!` + `chife-mod/SF-Projects-Dashboard` | `!sfg-dashboard!/` *(repo: chife-mod/sfg-dashboard)* | http://localhost:4200/ | dashboard |
| `Watch360 PDF Reports` + `chife-mod/Watch360-PDF-Reports` | `reports/green-reports/watch-media/` | http://localhost:4201/ | report |
| `M360-jewelry-weekly-pulse` | `reports/green-reports/weekly-pulse/sacet/` | http://localhost:4204/ | report |
| `Watch360_LinkedIn_PDF_animations_remotion` (содержит 2 репо: `watch360-linkedin-pdf` + `watch360-remotion`) | `reports/linkedin-remotion/` *(объединить)* | http://localhost:4202/ | report |
| `Market360_Signal_Selector` + `chife-mod/Market360_Signal_Selector` | `prototypes/m360-signal-selector/` | http://localhost:4205/ | prototype |
| `WWG 2026 Novelties Page Redesign` + `chife-mod/wwg-2026-novelties-redesign` | `prototypes/wwg-2026-novelties-redesign/` | http://localhost:4206/ | prototype |
| `chife-mod/support-icon` *(GH-only)* | `prototypes/sf-ui-support-icon/` | — | prototype |
| `Figma_To_PPT` + `chife-mod/Tina_Karol_PPT` | `tools/figma-to-ppt/` *(merge репо)* | http://localhost:4203/ | tool |
| `Market 360 Google Sheets` | `misc/m360-sheets/` *(?)* | — | misc |
| ~~`chife-mod/Logo-Parser`~~ | **OUT — Vsevolod вынесет из проекта** | — | — |
| ~~`sf-reports/`~~ | **DELETED — содержимое архивировано в `_archive/`** | — | — |

---

## Open questions для созвона во вторник 12 мая

1. **🔴 Имена папок: plural или singular?** `prototype` vs `prototypes`, `green-report` vs `green-reports`. Рекомендация Claude: **plural для категорий**.

2. **🔴 Имя shared-папки:** `shared-templates/` vs `_shared/` vs `shared/` vs `templates/`. Рекомендация Claude: **`_shared/`** (короче, сортируется в топ).

3. **🔴 `wwg-26` vs `wwg-2026`** в slug. Рекомендация Claude: **`wwg-2026`** (полная форма, уже на GH Pages).

4. **🔴 `misc/` папка нужна?** Куда `m360-sheets`?

5. **🔴 `linkedin-remotion` — отдельный template?** Если он использует свой визуальный стиль — да, как сосед `green-reports/`.

6. **🟡 Переименование репо `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse`** — могут ли они стать deploy-only target'ами с переименованием? URL Pages поменяется (`chife-mod.github.io/Watch360-PDF-Reports/` → `…/w360-pdf-reports/`). Если URL критичен (red-line из архивного плана) — оставляем имена репо как есть, только slug-папок меняем.

7. **🟡 Стратегия миграции:** big-bang (всё за один раз) или phased (репо за репо)?

8. **🟡 Cross-repo deploy** — переиспользовать стратегию из архивного плана (`peaceiris/actions-gh-pages` + `external_repository`)?

---

## Что сделано в сессии 10 мая

- ✅ Запущены локальные превью всех проектов на портах 4200-4206
- ✅ Согласована таксономия (4 типа + 2 теговых оси)
- ✅ Согласована 3-уровневая иерархия для отчётов
- ✅ Архивированы README + миграционный план из `sf-reports/` в [`_archive/`](./_archive/)
- ✅ Удалена папка `sf-reports/` (концепция растворена в этой структуре)
- ✅ Переименована рабочая папка `!SFG Dashboard!` → `!sfg-dashboard!`
- ✅ Создан репо `chife-mod/sfg-dashboard` *(переименован из `SF-Projects-Dashboard`)*
- ✅ Этот документ и обновлённый `CLAUDE.md` закоммичены и пушнуты

## Что НЕ сделано (ждёт вторника)

- ❌ Физическая реорганизация папок (`reports/`, `prototypes/`, `tools/` ещё не созданы)
- ❌ Переименование репозиториев под новый kebab-case slug
- ❌ Миграция кода в новую иерархию `green-reports/...`
- ❌ Извлечение `_shared/` из `Watch360 PDF Reports` и `M360-jewelry-weekly-pulse`
- ❌ Объединение `figma-to-ppt` + `tina-karol-ppt` в один репо
- ❌ Обновление `index.html` дашборда под новые секции и ссылки

## Точка возобновления (для следующей сессии Claude)

1. Прочитай этот документ сверху вниз.
2. Прочитай [`_archive/2026-05-05-monorepo-migration.md`](./_archive/2026-05-05-monorepo-migration.md) — там source mapping и Vite-конфиг.
3. Получи от Олега ответы на open questions (после созвона с Vsevolod).
4. Обнови этот документ под финальные ответы.
5. Только тогда вызывай skill `superpowers:writing-plans` для детального плана имплементации.
