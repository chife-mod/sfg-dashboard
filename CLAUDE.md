# SFG Dashboard — Project Memory

> **🟡 СТАТУС НА 2026-05-10 — РЕСТРУКТУРИЗАЦИЯ В ПРОЦЕССЕ, ПАУЗА ДО 2026-05-12.**
>
> Клиент (Vsevolod) прислал письмо с видением структуры всех SF-проектов. Сегодня Олег + Claude провели брейншторм, согласовали таксономию (4 типа: report / prototype / tool / misc) и 3-уровневую иерархию для отчётов (`<template>/<type>/<client>/`).
>
> **Во вторник 12 мая** — созвон Олег ↔ Vsevolod, после которого финализируем open questions и стартуем имплементацию.
>
> **На следующий запуск Claude:**
> 1. Прочитай [`docs/plans/2026-05-10-vsevolod-restructure-design.md`](docs/plans/2026-05-10-vsevolod-restructure-design.md) сверху вниз — там вся актуальная картина.
> 2. Загляни в [`docs/plans/_archive/2026-05-05-monorepo-migration.md`](docs/plans/_archive/2026-05-05-monorepo-migration.md) — детальный 24-task план миграции с Vite-конфигом и cross-repo deploy strategy. Не выкидывать, использовать как референс при имплементации.
> 3. Получи у Олега ответы на open questions (см. конец design-doc'а).
> 4. Только потом вызывай `superpowers:writing-plans`.

---

## Что это

Статический дашборд-индекс всех веб-проектов, сделанных для Semantic Force Group.
Деплоится на GitHub Pages: **https://chife-mod.github.io/sfg-dashboard/** *(переименован из SF-Projects-Dashboard 2026-05-10)*

Репозиторий: `chife-mod/sfg-dashboard` (public)
Локальный путь: `/Users/oleg/Dev/Vsevolod/!sfg-dashboard!/`

---

## Активные локальные превью (порты 4200-4206)

| Порт | Проект | Откуда |
|---|---|---|
| 4200 | sfg-dashboard | этот HTML |
| 4201 | w360-pdf-reports | `Watch360 PDF Reports/dist/` |
| 4202 | w360-linkedin-pdf | `Watch360_LinkedIn_PDF_animations_remotion/report-pdf/dist/` |
| 4203 | figma-to-ppt | `Figma_To_PPT/` (Next.js dev) |
| 4204 | m360-jewelry-weekly-pulse | `M360-jewelry-weekly-pulse/dist/` |
| 4205 | m360-signal-selector | `Market360_Signal_Selector/out/` |
| 4206 | wwg-2026-novelties-redesign | `WWG 2026 Novelties Page Redesign/prototype/dist/` |

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

## Проекты на GitHub Pages (секция LIVE)

| Карточка | URL | Обложка |
|---|---|---|
| WWG 2026 Novelties Redesign | https://chife-mod.github.io/wwg-2026-novelties-redesign/ | `wwg-novelties.png` |
| Watch360 LinkedIn PDF | https://chife-mod.github.io/watch360-linkedin-pdf/ | `watch360-linkedin-pdf.png` |
| Watch360 PDF Reports | https://chife-mod.github.io/watch360-pdf-reports/ | `watch360-pdf-reports.png` |
| Market360 Signal Selector | https://chife-mod.github.io/Market360_Signal_Selector/ | `market360-signal-selector.jpg` |
| Support Icon | https://chife-mod.github.io/support-icon/ | `support-icon.png` |

## Проекты локальные (секция IN PROGRESS)

| Карточка | Путь | Обложка |
|---|---|---|
| SlideForge | `.../SlideForge/` | `slideforge.png` |
| Logo Parser | `.../Logo Parser/` | `logo-parser.png` |
| Market360 Google Sheets | `.../Market360_Sheets/` | `market360-sheets.png` |
| *(пустая карточка)* | — | — |

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
cd "/Users/oleg/My Drive/Dev/Project/Vsevolod/!SF Projects Dashboard!"
git add <файлы>
git commit -m "описание"
git push origin main
```

GitHub Pages обновляется через ~1 минуту после push.

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

Сервер запускается через `.claude/launch.json` или вручную:
```bash
cd "/Users/oleg/My Drive/Dev/Project/Vsevolod/!SF Projects Dashboard!"
python3 -m http.server 4200
# → http://localhost:4200
```

Важно: открывать через HTTP, не через `file://` — иначе картинки не грузятся.
