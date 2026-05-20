# SFG Dashboard — Project Memory

> **✅ СТАТУС НА 2026-05-20 — РЕСТРУКТУРИЗАЦИЯ ЗАВЕРШЕНА. Mонорепо `chife-mod/sfg-reports` создан.**
>
> Все Green Reports шаблоны живут в одном месте: `sfg-reports/shared/slides/`
> (24 layouts, теги Cover / Overview / Table / Models / Keyword / Quote / Map /
> Posts / Reviews / Heatmap / Sandbox / Unused). Templates catalog задеплоен
> отдельным артефактом: https://chife-mod.github.io/sfg-templates-viewer/.
>
> Watch Media (feb-2026) и Sachet (apr-20-26) **frozen в своих репо** —
> incremental migration: новые выпуски будут писаться в монорепо, старые
> остаются как snapshot. Live URLs не сломаны.
>
> **Что осталось — ручные действия Олега** (см. [`docs/plans/2026-05-20-restructure-handoff.md`](docs/plans/2026-05-20-restructure-handoff.md) секция "Что осталось"):
> 1. Создать PAT_DEPLOY secret в `sfg-reports` (5 мин) — для auto-deploy Templates
> 2. `gh auth refresh -h github.com -s delete_repo` → удалить 3 устаревших репо
> 3. Отозвать leaked PAT (`gho_zgyvmbb...`) в GitHub Settings
>
> **На следующий запуск Claude:**
> - Если задача о Green Reports / шаблонах → работай в `/Users/oleg/Dev/vsevolod/sfg-reports/`
> - Если задача о дашборде → этот репо (`!sfg-dashboard!/`)
> - Документация workflow для нового клиента: `sfg-reports/docs/how-to-add-client.md`
> - Архивный план миграции (5 мая) теперь помечен SUPERSEDED — не выполнять, читать только как историю архитектурных решений.

---

## Что это

Статический дашборд-индекс всех веб-проектов, сделанных для Semantic Force Group.
Деплоится на GitHub Pages: **https://chife-mod.github.io/sfg-dashboard/** *(переименован из SF-Projects-Dashboard 2026-05-10)*

Репозиторий: `chife-mod/sfg-dashboard` (public)
Локальный путь: `/Users/oleg/Dev/Vsevolod/!sfg-dashboard!/`

---

## Локальные dev-команды

| Проект | Папка | Команда |
|---|---|---|
| sfg-dashboard (этот) | `!sfg-dashboard!/` | `python3 -m http.server 4200` |
| Templates catalog (новый монорепо) | `sfg-reports/` | `npm run dev:templates` |
| Watch Media (frozen) | `reports/green-reports/watch-media/` | `npm run dev` |
| Sachet weekly-pulse (frozen) | `reports/green-reports/weekly-pulse/sachet/` | `npm run dev` |
| LinkedIn PDF | `reports/linkedin-remotion/report-pdf/` | `npm run dev` |
| M360 Signal Selector | `prototypes/m360-signal-selector/` | `npm run dev` |
| WWG Novelties | `prototypes/wwg-2026-novelties-redesign/` | `npm run dev` |

---

## Стек

- Чистый HTML + CSS (один файл `index.html`, без сборщика)
- Шрифт: Inter (Google Fonts)
- Деплой: GitHub Pages из ветки `main`, корень репозитория
- Локальный превью: Python HTTP-сервер на порту 4200 (`.claude/launch.json`)

---

## Дизайн-система

Взята из Figma SF Group Site (`pML31t2SU9Pno9nchlHmI8`, node `1:3` и `14:690`).

```css
--bg: #0d0d0d
--surface: rgba(22, 22, 22, 0.85)
--border: rgba(255, 255, 255, 0.07)
--border-hover: rgba(0, 195, 217, 0.4)
--accent: #00c3d9          /* cyan */
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.5)
--text-muted: rgba(255, 255, 255, 0.28)
--radius: 12px
```

**Карточки**: `backdrop-filter: blur(10px)`, `background: rgba(22,22,22,0.85)`, border-radius 12px.
**Хедер**: два glass-pill блока (icon + text), высота 64px, gap 4px. Pixel-perfect из Figma node `14:690`.

---

## Структура index.html

```
header
  .logo (div, не ссылка — не кликабельный)
    .logo-pill.logo-icon-pill   → Logo.svg 59×40px
    .logo-pill.logo-text-pill   → SemanticForce / Group
  .header-meta

.hero
  .hero-label (SF GROUP · CLIENT WORK)
  h1.hero-title  → "Projects Dashboard" (одна строка, Dashboard — cyan)
  p.hero-sub     → подзаголовок

main
  section.section × 2
    .section-header
      .section-header-left
        .section-indicator (.section-dot + .section-label)  ← статус НАД заголовком
        h2.section-title
      .section-count

    .cards-grid
      a.card (href = live URL)
        .card-cover img
        .card-body
          .card-top
            .badge.badge-live  ← СЛЕВА
            .card-name         ← flex:1, справа
          .card-desc
          .card-tags
          .card-footer
```

---

## Карточки дашборда (текущее состояние)

Дашборд двухуровневый: главный экран → 5 категорий → подэкран с фильтрами.

| Категория | Карточки |
|---|---|
| Green Reports | Templates (sfg-templates-viewer) · Watch Media · Weekly Pulse · Sachet |
| LinkedIn Remotion | Templates (placeholder) · LinkedIn PDF · Remotion Video |
| Prototypes | WWG Novelties · M360 Signal Selector · BSCC · Manu.ai · SF Product Matching |
| Tools | *(пусто)* |
| Misc | Market360 Google Sheets |

Каждая карточка имеет `data-customer/type/platform/brand` — для фильтров +
автоматически рендерятся chip-теги внизу карточки (через JS в этом же файле).

---

## Обложки (assets/covers/)

Файлы — реальные скриншоты живых страниц. Форматы смешанные (PNG и JPG).

**Как добавить новую обложку:**
Пользователь присылает скриншот прямо в чат. Извлечь его из JSONL-файла разговора:

```python
import json, base64

path = "/Users/oleg/.claude/projects/-Users-oleg-My-Drive-Dev-Project-Vsevolod--SF-Projects-Dashboard-/<session-id>.jsonl"
images = []
with open(path) as f:
    for line in f:
        obj = json.loads(line)
        msg = obj.get('message', obj)
        if msg.get('role') == 'user':
            for item in msg.get('content', []):
                if isinstance(item, dict) and item.get('type') == 'image':
                    data = item['source']['data']
                    if data not in [d for _, d in images]:
                        images.append((i, data))

# Последний скрин — images[-1]
img_bytes = base64.b64decode(images[-1][1])
with open('assets/covers/xxx.jpg', 'wb') as f:
    f.write(img_bytes)
```

После сохранения обязательно проверить расширение: `file assets/covers/xxx.jpg`
JPEG сохранять как `.jpg`, PNG как `.png`. Обновить `<img src>` в index.html.

---

## Деплой

```bash
cd /Users/oleg/Dev/vsevolod/\!sfg-dashboard\!
git add <файлы>
git commit -m "описание"
git push origin main
```

GitHub Pages обновляется через ~1 минуту после push (deploy из ветки main).

---

## Что уже сделано / ключевые решения

- **Логотип** — `<div class="logo">` (не `<a>`). Было ошибочно поставлена ссылка на sf-group.com, которая ведёт на французскую строительную компанию Soletanche Freyssinet. Убрали.
- **Hero divider** — убран (была градиентная линия `.hero-divider` под подзаголовком).
- **Статус-лейбл** — "Published" / "In Progress" стоит НАД заголовком секции, не под.
- **Badge** — всегда слева от названия карточки (`.card-top { display: flex; gap: 10px; }`).
- **Hero title** — одна строка: `Projects <span>Dashboard</span>`.

---

## Починенные баги в смежных проектах

### Market360 Signal Selector (`chife-mod/Market360_Signal_Selector`)

Репо переименовано из `M360_C` → `Market360_Signal_Selector` без пересборки.
Три проблемы и их фиксы:

1. **Jekyll блокировал `_next/`** → добавить `.nojekyll` в gh-pages ветку
2. **Неверный basePath** → `next.config.ts`: `basePath: '/Market360_Signal_Selector'`
3. **Иконки по неверным путям** → `next.config.ts`: `env: { NEXT_PUBLIC_BASE_PATH: '/Market360_Signal_Selector' }`

После фикса — пересобрать и задеплоить:
```bash
cd ".../Market360_Signal_Selector"
npm run build
touch out/.nojekyll
npx gh-pages -d out --repo https://github.com/chife-mod/Market360_Signal_Selector.git --dotfiles
```

---

## Локальный запуск превью

```bash
cd /Users/oleg/Dev/vsevolod/\!sfg-dashboard\!
python3 -m http.server 4200
# → http://localhost:4200
```

Важно: открывать через HTTP, не через `file://` — иначе картинки не грузятся.
