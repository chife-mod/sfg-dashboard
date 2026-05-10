# SF Reports Monorepo — Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Status: 🟡 PAUSED — ждём вводные от Олега утром 2026-05-06.** См. секцию [Discussion log & open questions](#discussion-log--open-questions-2026-05-05) в конце.

**Goal:** Объединить `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse` в один монорепо `sf-reports` с общей библиотекой `shared/`. Сохранить оба боевых Pages-URL без изменений. Настроить cross-repo автодеплой через GitHub Actions. Обновить `SF-Projects-Dashboard`.

**Architecture:** Monorepo с иерархией `products/<type>/<client>/`. Один тип отчёта `weekly-pulse`, два клиента: `sacet` и `watch-media`. Multi-entry Vite build. Workflow `peaceiris/actions-gh-pages` с `external_repository` для пуша билдов в `gh-pages` ветки старых репо. Старые репо превращаются в read-only deploy-targets.

**Tech Stack:** React 18 + TypeScript + Vite 6 + Tailwind 4 + Recharts + Puppeteer + GitHub Actions. Та же что в текущих репо — никаких новых зависимостей.

---

## 🚨 Red-line constraints

1. **`https://chife-mod.github.io/M360-jewelry-weekly-pulse/` НЕ должен сломаться ни на одну секунду.**
2. **`https://chife-mod.github.io/Watch360-PDF-Reports/` тоже не должен сломаться.**
3. Старые репо остаются на GitHub, ветка `gh-pages` сохраняется, Pages-настройки не трогаем.
4. Если на любом шаге URL отдаёт 404 / другую страницу / отличается от прода — **остановиться и спросить Олега**.

---

## Source mapping (что куда)

| Откуда (текущее состояние) | Куда (sf-reports) |
|---|---|
| `M360-jewelry-weekly-pulse/src/components/slides/*` (актуальные V2/V3) | `shared/slides/*.tsx` |
| `M360-jewelry-weekly-pulse/src/components/ui/*` | `shared/ui/*` |
| `M360-jewelry-weekly-pulse/src/theme/*` | `shared/theme/*` |
| `M360-jewelry-weekly-pulse/src/lib/*` | `shared/lib/*` |
| общие SVG/лого | `shared/assets/*` |
| `M360-jewelry-weekly-pulse/src/main.tsx, App.tsx, reports.ts, data/` | `products/weekly-pulse/sacet/src/*` |
| `Watch360 PDF Reports/src/main.tsx, App.tsx, reports.ts, data/` | `products/weekly-pulse/watch-media/src/*` |
| Watch360 sandbox / templates page / Sacet-остатки | **отрезаются** (см. Task 16) |

---

## Pre-flight (от Олега до старта)

**P1.** Подтвердить план (этот документ).
**P2.** Создать **GitHub Personal Access Token** с правами `repo` на `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse`. Положить в `sf-reports` как secret `PAT_DEPLOY` после создания репо (Task 13).
**P3.** Подтвердить порядок миграции: **Sacet первым** (там source of truth для shared), потом Watch Media.

---

## Phase 0: Bootstrap монорепо (локально, без GitHub)

### Task 1: npm + git init
**Files:** `sf-reports/package.json`, `.gitignore`, `.nvmrc`

1. `cd sf-reports && git init`
2. `npm init -y`, отредактировать: `name: sf-reports`, `private: true`
3. Скопировать `.gitignore` из `M360-jewelry-weekly-pulse`
4. `git add . && git commit -m "chore: bootstrap monorepo"`

### Task 2: Установка зависимостей
**Files:** `package.json`

1. Сверить версии с `M360-jewelry-weekly-pulse/package.json`, скопировать deps один-в-один
2. `npm install`
3. `git add package.json package-lock.json && git commit -m "chore: install deps"`

### Task 3: TypeScript + Vite multi-entry
**Files:** `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`

1. Скопировать `tsconfig*.json` из M360
2. Добавить в `tsconfig.app.json`:
   ```json
   "paths": { "@shared/*": ["./shared/*"] }
   ```
3. `vite.config.ts`:
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwind from '@tailwindcss/vite'
   import { resolve } from 'path'

   export default defineConfig({
     plugins: [react(), tailwind()],
     resolve: { alias: { '@shared': resolve(__dirname, 'shared') } },
     build: {
       rollupOptions: {
         input: {
           sacet: resolve(__dirname, 'products/weekly-pulse/sacet/index.html'),
           'watch-media': resolve(__dirname, 'products/weekly-pulse/watch-media/index.html'),
         }
       }
     }
   })
   ```
4. Скрипты в `package.json`:
   ```json
   "dev:sacet": "vite products/weekly-pulse/sacet",
   "dev:watch-media": "vite products/weekly-pulse/watch-media",
   "build:sacet": "vite build products/weekly-pulse/sacet --outDir ../../../../dist/sacet",
   "build:watch-media": "vite build products/weekly-pulse/watch-media --outDir ../../../../dist/watch-media",
   "build": "npm run build:sacet && npm run build:watch-media"
   ```
5. `git commit -m "chore: vite multi-entry config"`

### Task 4: Tailwind config
**Files:** `tailwind.config.ts`

1. Скопировать tailwind config из M360
2. `content: ['./shared/**/*.{ts,tsx}', './products/**/*.{ts,tsx,html}']`
3. `git commit -m "chore: tailwind config"`

---

## Phase 1: shared/ (источник истины)

### Task 5: Скелет shared/
**Files:** `shared/{slides,ui,theme,lib,assets}/.gitkeep`

1. `mkdir -p shared/{slides,ui,theme,lib,assets}`
2. `git commit -m "chore: shared/ skeleton"`

### Task 6: Перенос theme/ + ui/
1. Скопировать `theme/colors.ts`, `theme/typography.ts`, `theme/index.ts` → `shared/theme/`
2. Скопировать `SlideFrame.tsx`, `SlideTitle.tsx`, `Logo.tsx` → `shared/ui/`
3. Заменить относительные импорты на `@shared/theme`
4. `npx tsc --noEmit` — проверить компиляцию
5. `git commit -m "feat: migrate theme + ui to shared"`

### Task 7: Перенос lib/
1. Скопировать `lib/pdf.ts`, `lib/sheets.ts` → `shared/lib/`
2. Поправить импорты на `@shared/...`
3. `git commit -m "feat: migrate lib to shared"`

### Task 8: Перенос slides
1. Открыть `M360-jewelry-weekly-pulse/src/reports.ts` — собрать список используемых компонентов слайдов
2. Открыть `Watch360 PDF Reports/src/reports.ts` (или эквивалент) — добавить в список те, что нужны для Watch Media отчётов
3. Скопировать каждый в `shared/slides/<Name>.tsx` (берём актуальные V2/V3 как baseline без суффикса)
4. Поправить импорты на `@shared/{theme,ui,lib}`
5. `npx tsc --noEmit` — без ошибок
6. `git commit -m "feat: migrate slide templates to shared"`

### Task 9: Перенос assets/
1. Общие лого SF, иконки → `shared/assets/`
2. Клиентские лого (Sacet brand, Watch Media brand) **оставляем** для переноса в `products/<...>/public/`
3. `git commit -m "feat: migrate shared assets"`

---

## Phase 2: products/weekly-pulse/sacet/

### Task 10: Скелет sacet
**Files:** `products/weekly-pulse/sacet/{index.html, public/, src/{main.tsx, App.tsx, reports.ts, data/}}`

1. `mkdir -p products/weekly-pulse/sacet/{public,src/data}`
2. `index.html` — копия из M360, скрипт `<script type="module" src="/src/main.tsx"></script>`
3. Скопировать `main.tsx`, `App.tsx` из `M360-jewelry-weekly-pulse/src/`, поправить импорты на `@shared/...`
4. Скопировать `reports.ts` целиком, поправить импорты слайдов на `@shared/slides`
5. Скопировать `data/` целиком
6. Скопировать Sacet лого, favicon → `public/`
7. `git commit -m "feat: weekly-pulse/sacet skeleton"`

### Task 11: Локальный smoke-тест Sacet
1. `npm run dev:sacet`
2. Открыть `localhost:5173/`
3. **Прокликать все отчёты в dropdown** — каждый рендерится идентично текущему `chife-mod.github.io/M360-jewelry-weekly-pulse/`
4. Открыть оба URL рядом, сверить визуально слайд за слайдом
5. **Если расхождения — стоп, чинить, не идти дальше**
6. `git commit -m "test: sacet local smoke passed"`

---

## Phase 3: GitHub репо + cross-repo deploy для Sacet

### Task 12: Создать GitHub репо
1. `gh repo create chife-mod/sf-reports --private --source=. --remote=origin --push`
2. Проверить `gh repo view`

### Task 13: PAT secret
1. Олег создаёт fine-grained PAT в GitHub Settings, scope: `repo` на `Watch360-PDF-Reports` + `M360-jewelry-weekly-pulse`
2. `gh secret set PAT_DEPLOY -b"<token>"` в `sf-reports`
3. `gh secret list` — verify

### Task 14: Workflow (Sacet only пока)
**Files:** `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-sacet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build:sacet
      - uses: peaceiris/actions-gh-pages@v3
        with:
          personal_token: ${{ secrets.PAT_DEPLOY }}
          external_repository: chife-mod/M360-jewelry-weekly-pulse
          publish_branch: gh-pages
          publish_dir: ./dist/sacet
```

Без условий — деплоим обоих всегда. Path-фильтры добавим в Task 23 как оптимизацию.

`git commit -m "ci: cross-repo deploy for sacet" && git push`

### Task 15: 🚨 Critical — тестовый деплой Sacet
1. Дождаться workflow в GitHub Actions
2. Открыть `https://chife-mod.github.io/M360-jewelry-weekly-pulse/`
3. Все отчёты в dropdown открываются, все слайды рендерятся
4. Сверить с состоянием до миграции (если есть скриншот) или с локальным dev
5. **Если что-то отличается — откатить, разобраться, не идти дальше**

---

## Phase 4: products/weekly-pulse/watch-media/

### Task 16: Аудит Watch360-PDF-Reports — что отрезаем
1. Открыть `Watch360 PDF Reports/src/`
2. Определить что **остаётся** для Watch Media:
   - `App.tsx` (релизный режим, БЕЗ TemplatesPage / sandbox)
   - `reports.ts` — оставить только релизные Watch Media отчёты
   - `data/` — данные Watch Media
3. **Отрезаем:**
   - TemplatesPage (`src/app/TemplatesPage.tsx`)
   - sandbox / playground страницы
   - Sacet-related отчёты в `reports.ts` (если они там есть как наследие)
   - `CoverWeeklyPulse`, `SacetSoMeInsightsSlide*`, `BoutiqueReviewsSlide` — НЕ переносим в watch-media (они для Sacet, остаются в shared/)
4. Записать решение в `docs/plans/2026-05-05-watch-media-cleanup.md` (что отрезали и почему)

### Task 17: Скелет watch-media
**Files:** `products/weekly-pulse/watch-media/{index.html, public/, src/{main.tsx, App.tsx, reports.ts, data/}}`

1. Аналогично Task 10
2. `App.tsx` — урезанная версия (без templates view, только slide viewer + dropdown)
3. `reports.ts` — только релизные Watch Media выпуски
4. Watch Media лого / favicon → `public/`
5. `git commit -m "feat: weekly-pulse/watch-media skeleton (clean, no sandbox)"`

### Task 18: Локальный smoke-тест Watch Media
1. `npm run dev:watch-media`
2. Прокликать все отчёты, сверить с прод-URL `chife-mod.github.io/Watch360-PDF-Reports/`
3. **Контент идентичен** (даже если sandbox убрали — релизные отчёты должны быть один-в-один)
4. `git commit -m "test: watch-media local smoke passed"`

### Task 19: Workflow для Watch Media
**Files:** `.github/workflows/deploy.yml`

Добавить job `deploy-watch-media` зеркально `deploy-sacet`:
- `external_repository: chife-mod/Watch360-PDF-Reports`
- `publish_dir: ./dist/watch-media`
- `run: npm run build:watch-media`

`git commit -m "ci: cross-repo deploy for watch-media" && git push`

### Task 20: 🚨 Critical — тестовый деплой Watch Media
1. Workflow выполняется без ошибок
2. `https://chife-mod.github.io/Watch360-PDF-Reports/` — открывается, релизные отчёты идентичны прежним
3. Sandbox страницы должны быть **убраны** (это намеренно, см. Task 16)
4. ✅ Если всё ок — миграция завершена

---

## Phase 5: Замок старых репо

### Task 21: README в Watch360-PDF-Reports (deploy-target lock)
1. В `chife-mod/Watch360-PDF-Reports` обновить `README.md`:
   ```markdown
   # Watch360-PDF-Reports

   ⚠️ **Source moved to [chife-mod/sf-reports](https://github.com/chife-mod/sf-reports).**

   This repo is now a deploy-target only. The `gh-pages` branch is updated
   automatically by the workflow in `sf-reports`.

   GitHub Pages: https://chife-mod.github.io/Watch360-PDF-Reports/ (unchanged)

   To make changes — open `chife-mod/sf-reports`, edit
   `products/weekly-pulse/watch-media/`, push to main.
   ```
2. Закоммитить в `main` старого репо

### Task 22: README в M360-jewelry-weekly-pulse
1. Аналогично, ссылаясь на `products/weekly-pulse/sacet/`

### Task 23: Path-фильтры в workflow (оптимизация)
**Files:** `.github/workflows/deploy.yml`

Добавить умные триггеры — `paths` фильтры:
```yaml
deploy-sacet:
  if: |
    contains(github.event.head_commit.message, '[skip ci]') == false &&
    (github.event_name == 'workflow_dispatch' ||
     contains(toJson(github.event.commits.*.modified), 'shared/') ||
     contains(toJson(github.event.commits.*.modified), 'products/weekly-pulse/sacet/'))
```

Так Sacet деплоится только когда правят `shared/` или его собственные файлы. Watch-media зеркально.

`git commit -m "ci: smart path-based deploy triggers" && git push`

---

## Phase 6: SF Projects Dashboard

### Task 24: Обновить SF-Projects-Dashboard
**Source:** `/Users/oleg/My Drive/Dev/Project/Vsevolod/!SF Projects Dashboard!/index.html`
**Target:** `chife-mod/SF-Projects-Dashboard` → `chife-mod.github.io/SF-Projects-Dashboard/`

1. Найти карточки текущих проектов в `index.html`:
   - "Watch360 PDF Reports" (скорее всего ссылка на `chife-mod.github.io/Watch360-PDF-Reports/`)
   - "M360 Jewelry Weekly Pulse" (на `M360-jewelry-weekly-pulse`)
2. Обновить:
   - **Карточка Watch360 PDF Reports** → переименовать в "**Weekly Pulse — Watch Media**", URL остаётся тот же
   - **Карточка M360** → переименовать в "**Weekly Pulse — Sacet**" (или "Sacet Weekly Pulse"), URL тот же
   - Опционально: добавить badge "via sf-reports" или secondary-ссылку на репо `chife-mod/sf-reports`
3. Локально проверить `index.html` в браузере
4. Закоммитить и запушить → дашборд деплоится через свой workflow

### Task 25: history/ запись
**Files:** `sf-reports/history/2026-05-05-monorepo-migration.md`

1. Записать дату, какие репо мигрировали, какие коммиты, какой sandbox-контент отрезали из Watch Media
2. `git commit -m "docs: migration history entry"`

### Task 26: How-to docs
**Files:** `sf-reports/docs/how-to-add-client.md`, `how-to-add-slide.md`, `how-to-version-slide.md`

1. Три краткие how-to (30-50 строк каждая) с примерами
2. `git commit -m "docs: how-to guides"`

---

## Verification (final)

После всех тасков:

1. ✅ `https://chife-mod.github.io/M360-jewelry-weekly-pulse/` — открывается, контент идентичен прежнему
2. ✅ `https://chife-mod.github.io/Watch360-PDF-Reports/` — открывается, релизные Watch Media отчёты идентичны (sandbox убран намеренно)
3. ✅ `https://chife-mod.github.io/SF-Projects-Dashboard/` — карточки переименованы, ссылки работают
4. ✅ Push в `sf-reports/main` с правкой `shared/slides/CoverSlide.tsx` → workflow собирает обоих клиентов
5. ✅ Push с правкой `products/weekly-pulse/sacet/...` → workflow деплоит **только Sacet**
6. ✅ Старые репо `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse` имеют README с указанием на `sf-reports`
7. ✅ В `sf-reports/README.md` структура и правила понятны за 2 минуты чтения

---

## Что делаем СЕЙЧАС (после твоего ОК)

Начну с **Phase 0 (Tasks 1-4)** — локальный каркас sf-reports без касания старых репо. После Phase 0 покажу результат, попрошу создать PAT (Pre-flight P2), и продолжу.

Боевые репо `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse` не трогаются вручную ни на одном шаге кроме Tasks 15 и 20 (тестовые деплои через workflow) и Tasks 21-22 (правка README в `main`).

**Жду твоего «поехали».**

---

## Discussion log & open questions (2026-05-05)

> Записано в конце сессии чтобы завтра утром не восстанавливать контекст с нуля.

### Хронология обсуждения

1. **Старт сессии — другой запрос.** Олег попросил поставить Watch360 на GitHub Pages + сервис комментариев (3 проекта, ∞ комментов бесплатно).
   - Я обнаружил что Pages **уже работает** (`gh-pages` ветка, URL `chife-mod.github.io/Watch360-PDF-Reports/`, статус built).
   - По комментариям прошёл выбор: Giscus отвергли (требует GitHub-аккаунт у клиента), договорились на **Cusdis self-host на Vercel + Neon Postgres**.
   - **Олег сказал «пока не делать».** Решение по комментариям отложено, не реализовано.

2. **Поворот на инфраструктуру.** Олег попросил объединить Watch360-PDF-Reports + M360-jewelry-weekly-pulse в один проект с общими шаблонами.
   - Прежний `docs/architecture-split.md` (Watch360 ↔ M360 как два разных репо) **отменяется** — пора собирать в monorepo.

3. **Брейнсторм архитектуры.** Рассмотрели:
   - **Git submodule** — отвергли (плохой DX, ручные `submodule update`).
   - **npm package для shared** — отвергли (overkill, нужен publish-flow).
   - **Single Vite project с query-string переключением клиента** — отвергли (один deploy = все клиенты на одном URL, нарушает изоляцию).
   - **✅ Monorepo + cross-repo deploy через `peaceiris/actions-gh-pages` с `external_repository`** — выбрано.

4. **Иерархия — три итерации.**
   - **Итерация 1:** `clients/sacet/`, `clients/watch360/` плоско.
   - **Итерация 2** (Олег): «по типам отчётов»: `products/<type>/<client>/`. Один тип `weekly-pulse`, два клиента `sacet` + `watch-media` (текущий Watch360 переименовываем в watch-media как клиента).
   - **Итерация 3** (Олег, последняя): «нет, Weekly Pulse и Watch Media — это **два разных типа отчёта**, не клиенты». Финальная иерархия:
     ```
     products/
     ├── weekly-pulse/
     │   └── sacet/
     └── watch-media/
         └── <КЛИЕНТ?>     ← открытый вопрос
     ```

5. **Transcription glitch — «Подиум».** В сообщении Олега голосовой ввод услышал «Подиум» как название третьего типа отчёта. Олег уточнил — никакого Подиума нет, забываем.

6. **Версионирование shared.** Решение: компоненты в `shared/` **иммутабельные после деплоя**, breaking-изменения через файл-сосед `<Component>.v2.tsx`. Косметика правится in-place. Тот же паттерн что у нас стихийно появился (`SacetSoMeInsightsSlide` / V2 / V3) — теперь системно.

7. **Red-line constraint от Олега.** URL `chife-mod.github.io/M360-jewelry-weekly-pulse/` и `Watch360-PDF-Reports/` **не должны измениться ни на секунду**. Старые репо становятся deploy-only, Pages-настройки не трогаем, ветка `gh-pages` обновляется через cross-repo workflow.

8. **Watch360 cleanup.** При миграции `Watch360-PDF-Reports` → `products/watch-media/...` отрезаются: TemplatesPage, sandbox, Sacet-остатки. Остаётся только релизный контент (Rose Gold + Titanium и подобные).

9. **Bilstein.** Отдельный продукт, в `sf-reports` не входит, отдельный репо.

10. **SF-Projects-Dashboard.** Карточки текущих проектов на `chife-mod.github.io/SF-Projects-Dashboard/` нужно обновить — переименовать в `Weekly Pulse — Sacet` и `Watch Media`. Включено как Task 24.

### К чему пришли (договорённость на 2026-05-05)

| Вопрос | Решение |
|---|---|
| Имя монорепо | `sf-reports` ✅ |
| Иерархия | `products/<type>/<client>/` ✅ |
| Типы отчётов | `weekly-pulse` + `watch-media` ✅ |
| Sacet | `products/weekly-pulse/sacet/` ✅ |
| Клиент в watch-media | ❓ **открытый вопрос** |
| Версионирование shared | immutable + `<Name>.v2.tsx` ✅ |
| Deploy | GitHub Actions + cross-repo push в `gh-pages` ✅ |
| URL Pages | не меняются (red-line) ✅ |
| Watch Media migration | с очисткой sandbox/templates ✅ |
| Bilstein | вне scope ✅ |
| Comments service (Cusdis) | отложено, не делаем ✅ |
| Dashboard | обновляется в Task 24 ✅ |

### Открытые вопросы → ответы нужны утром 2026-05-06

1. **🔴 Кто клиент в `products/watch-media/`?**
   - (а) `sf` / `showcase` / `demo` — если это SemanticForce-овский внутренний/маркетинговый отчёт без внешнего заказчика
   - (б) Имя конкретного часового бренда — если есть реальный клиент
   - (в) Без вложенности — структура `products/watch-media/src/` плоско, без папки клиента (нарушает симметрию с weekly-pulse, но допустимо)

2. **«Поехали»** — после ответа на вопрос #1 запускаюсь с Phase 0 (Tasks 1-4).

3. **PAT для GitHub Actions** — нужен только когда дойдём до Task 13 (после локального каркаса и shared/). Не критично сейчас.

### Что готово (локально, без коммитов)

- ✅ `/Users/oleg/My Drive/Dev/Project/Vsevolod/sf-reports/README.md` — корневая инструкция
- ✅ `/Users/oleg/My Drive/Dev/Project/Vsevolod/sf-reports/docs/plans/2026-05-05-monorepo-migration.md` — этот план
- ✅ Папки `docs/plans/` созданы

### Что НЕ сделано

- ❌ GitHub-репо `chife-mod/sf-reports` не создано
- ❌ PAT не создан
- ❌ Боевые репо `Watch360-PDF-Reports` и `M360-jewelry-weekly-pulse` не тронуты — ни одной строчки
- ❌ Файлы из старых репо никуда не перенесены
- ❌ Workflow не настроен
- ❌ SF-Projects-Dashboard не обновлён

### Точка возобновления (для следующей сессии)

1. Прочитать этот раздел сверху вниз.
2. Получить от Олега ответ на открытый вопрос #1.
3. Обновить структуру в README + plan под финального клиента watch-media.
4. Запустить **Phase 0, Task 1** — `cd sf-reports && git init && npm init -y`.
5. Идти по плану таска-за-таской с использованием skill `superpowers:executing-plans`.
