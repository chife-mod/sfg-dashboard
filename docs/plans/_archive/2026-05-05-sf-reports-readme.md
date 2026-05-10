# SF Reports

Monorepo для PDF-отчётов Semantic Force. Один источник истины для шаблонов слайдов, изолированные клиентские проекты, автодеплой на их GitHub Pages.

> **Когда зашёл в этот репо после паузы — читай этот README сверху вниз, потом загляни в [`docs/plans/`](docs/plans/) если нужен текущий план работы.**

---

## Что это и зачем

- **Один монорепо `sf-reports`** = библиотека шаблонов + N клиентских отчётов.
- **Иерархия = `products/<тип-отчёта>/<клиент>/`.**
  - **Тип отчёта** — формат / ритм (`weekly-pulse`, в будущем возможно ещё какие-то).
  - **Клиент** — конкретный заказчик (`sacet`, `watch-media`).
- **Каждая пара тип-клиент = свой GitHub Pages-сайт.** Клиенты друг друга не видят, у каждого свой URL.
- **Деплой автоматический** через GitHub Actions: push в `main` → workflow собирает изменённых клиентов → пушит билд в `gh-pages` ветки **отдельных репо**.
- **Шаблоны слайдов общие.** Правишь компонент в `shared/` — он автоматически у всех клиентов, кто его импортит.

---

## Архитектура

```
sf-reports/                              ← этот репо (источник истины, приватный)
├── shared/                              ← БИБЛИОТЕКА (используется всеми клиентами)
│   ├── slides/                          ← шаблоны слайдов (immutable + версии)
│   │   ├── CoverSlide.tsx
│   │   ├── CoverSlide.v2.tsx            ← breaking-изменение → новый файл
│   │   ├── BoutiqueReviewsSlide.tsx
│   │   └── …
│   ├── ui/                              ← SlideFrame, SlideTitle, Logo
│   ├── theme/                           ← цвета, типографика, токены
│   ├── lib/                             ← pdf.ts, sheets.ts (общая логика)
│   └── assets/                          ← общие лого SF, иконки
│
├── products/                            ← ВИДЫ ОТЧЁТОВ
│   └── weekly-pulse/                    ← тип: еженедельный пульс
│       ├── sacet/                       ← клиент (Jewelry / M360)
│       │   ├── index.html
│       │   ├── public/                  ← клиентские лого, favicon
│       │   └── src/
│       │       ├── main.tsx
│       │       ├── App.tsx
│       │       ├── reports.ts           ← список выпусков (dropdown)
│       │       └── data/                ← данные конкретных дат
│       │
│       └── watch-media/                 ← клиент (Watch индустрия / Watch360)
│           └── (та же структура)
│
├── .github/workflows/
│   └── deploy.yml                       ← автодеплой при push в main
│
├── docs/
│   ├── plans/                           ← планы работы (читай свежий!)
│   ├── how-to-add-client.md
│   ├── how-to-add-slide.md
│   └── how-to-version-slide.md
│
└── README.md                            ← ты здесь
```

### Целевые репо для деплоя (НЕ редактируем напрямую)

| Источник в монорепо | Деплой-таргет | URL Pages |
|---|---|---|
| `products/weekly-pulse/sacet/` | `chife-mod/M360-jewelry-weekly-pulse` | `chife-mod.github.io/M360-jewelry-weekly-pulse/` |
| `products/weekly-pulse/watch-media/` | `chife-mod/Watch360-PDF-Reports` | `chife-mod.github.io/Watch360-PDF-Reports/` |

> **🚫 Эти репо — только deploy-target.** Никто туда вручную не коммитит. Все правки идут в `sf-reports/products/<type>/<client>/`, workflow сам пушит билд в их `gh-pages` ветки.
>
> **🔒 URL Pages — священны.** `chife-mod.github.io/<repo>/` не должен меняться. Любая миграция, которая может его сломать, требует подтверждения.

---

## Quickstart

### 1. Установка
```bash
git clone git@github.com:chife-mod/sf-reports.git
cd sf-reports
npm install
```

### 2. Локальное превью одного клиента
```bash
npm run dev:sacet           # Sacet Weekly Pulse
npm run dev:watch-media     # Watch Media Weekly Pulse
```

### 3. Сборка всех клиентов
```bash
npm run build               # билдит всех в dist/<client>/
```

### 4. Деплой
```bash
git push origin main        # workflow сам соберёт и задеплоит изменённых
```

---

## Типичные сценарии

### Подправить существующий слайд

1. Открой `shared/slides/<SlideName>.tsx`.
2. Если правка **косметическая** (тайпо, padding, цвет, мелкий фикс) — правь in-place. Применится ко всем клиентам, кто импортит этот слайд.
3. Если правка **breaking** (меняет props / layout / ломает существующих клиентов) — **создай новый файл** `<SlideName>.v2.tsx` рядом. Старый не трогай. В `products/<type>/<client>/src/reports.ts` поменяй импорт на v2 у нужного клиента.
4. См. `docs/how-to-version-slide.md`.

### Добавить новый выпуск отчёта

1. Положи данные в `products/<type>/<client>/src/data/<date>.ts`.
2. Добавь запись в `products/<type>/<client>/src/reports.ts`:
   ```ts
   {
     slug: '2026-05-05',
     title: 'Weekly Pulse — May 5',
     date: '2026-05-05',
     slides: [/* импорты из @shared/slides */]
   }
   ```
3. `npm run dev:<client>` — проверить локально.
4. `git push` — workflow задеплоит.

### Добавить нового клиента в существующий тип

1. Создай отдельный репо `chife-mod/<client-slug>` на GitHub (deploy target).
2. Скопируй `products/weekly-pulse/sacet/` → `products/weekly-pulse/<new-client>/` как стартер.
3. Замени `index.html`, лого, `reports.ts`.
4. Добавь job в `.github/workflows/deploy.yml` с `external_repository: chife-mod/<repo>`.
5. См. `docs/how-to-add-client.md`.

### Добавить новый тип отчёта

1. Создай папку `products/<new-type>/`.
2. Дальше как «добавить клиента» в этом типе.
3. Если у нового типа есть свои type-specific компоненты — клади их в `shared/slides/` (всё равно общая библиотека).

### Добавить новый шаблон слайда

1. Создай `shared/slides/<NewSlide>.tsx`. Используй `SlideFrame` из `shared/ui/`.
2. Импорт у клиента: `import { NewSlide } from '@shared/slides'`.
3. См. `docs/how-to-add-slide.md`.

---

## Правила

1. **`shared/` — иммутабельный после деплоя.** Breaking-изменение = новый файл с суффиксом версии. Никогда не редактируй чужие шаблоны "под себя".
2. **Клиент-специфичная вёрстка живёт в `products/<type>/<client>/src/`**, не в `shared/`. Логотипы, домены, имена компаний — пропсами в shared-слайды.
3. **Никто не коммитит в deploy-target репо вручную.** Только workflow.
4. **URL клиента — священен.** `chife-mod.github.io/<repo>/` не должен менять путь.
5. **Каждое значимое решение — в `docs/plans/` или `history/`.** Чтобы следующий заход не начинался с "а что мы тут делали".

---

## Что НЕ входит в этот репо

- **Bilstein / Market 360 Auto** — отдельный продукт, отдельный репо.
- **Project Dashboard** (`/Users/oleg/My Drive/Dev/Project/oz/Project Dashboard/`) — переиспользуемый темплейт-лаунчер для дизайн-проектов, не часть SF Reports.
- **Consilium** — система делегирования AI-моделям, отдельный workflow.

---

## Текущий статус

См. свежий план в [`docs/plans/`](docs/plans/). Если планов нет или они старше месяца — спроси у Олега что текущий приоритет.
