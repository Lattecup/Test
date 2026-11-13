# Отчёт ревью — T-1: Личный трекер доходов и расходов

**Ветка:** `feature/T-1` → `main` (merge-base `d2345c1`)
**Раздел:** `develop` (релиз не зафиксирован)
**Дата:** 2026-11-13
**Незакоммиченные изменения в момент ревью:** нет

## Сборка и тесты

### Backend

Проект не Maven (`backend-core/`, `agent-manager/`, `task-tracker/`, корневой `pom.xml` в ветке
отсутствуют) — бэкенд в этом инкременте представлен каркасом на Node.js + Express (`server/`).
Поэтому вместо `mvn clean install` выполнены `npm ci`-эквивалент и проверки серверного проекта:

- `npm install` — ✅
- `npm run lint` (eslint) — ✅ без ошибок
- `npm run build` (`tsc -p tsconfig.json`) — ✅ без ошибок
- `npm test` (vitest) — ✅ 4 теста в 1 файле, все пройдены
  (`src/__tests__/app.test.ts`: smoke `/api/health` и 501 на доменные эндпоинты)

### Frontend

- Lint (`npm run lint`): ✅ без ошибок
- Build (`npm run build` = `tsc --noEmit && vite build`): ✅ успешно
  (предупреждение vite о чанке > 500 kB — не ошибка)
- Тесты (`npm test`, vitest): ✅ 5 файлов, 44 теста, все пройдены
  (`money`, `operations`, `report`, `localStorageRepository`, рендер в jsdom)

## Изменённые файлы

```
.claude/conventions/index.md
.claude/conventions/java/controllers.md
.claude/conventions/java/dto.md
.claude/conventions/java/entity.md
.claude/conventions/java/index.md
.claude/conventions/java/layered-architecture.md
.claude/conventions/java/liquibase.md
.claude/conventions/java/lombok.md
.claude/conventions/java/mapstruct.md
.claude/conventions/shared/comments.md
.claude/conventions/shared/error-handling.md
.claude/conventions/shared/git-commits.md
.claude/conventions/shared/index.md
.claude/conventions/shared/testing.md
.claude/conventions/typescript/api-client.md
.claude/conventions/typescript/components.md
.claude/conventions/typescript/i18n.md
.claude/conventions/typescript/index.md
.claude/conventions/typescript/routing.md
.claude/skills/spec-increment-actualize_default/SKILL.md
.claude/skills/spec-increment-from-task_default/SKILL.md
.claude/skills/spec-increment-implement_default/SKILL.md
.claude/skills/spec-increment-review_default/SKILL.md
.claude/skills/spec-intent-generation_default/SKILL.md
.claude/skills/spec-repair-review-fails_default/SKILL.md
.claude/skills/spec-review-triage_default/SKILL.md
.gitignore
frontend/eslint.config.js
frontend/index.html
frontend/package-lock.json
frontend/package.json
frontend/src/App.tsx
frontend/src/__tests__/app.test.tsx
frontend/src/data/__tests__/localStorageRepository.test.ts
frontend/src/data/localStorageRepository.ts
frontend/src/data/repository.ts
frontend/src/data/seedCategories.json
frontend/src/data/storage.ts
frontend/src/domain/__tests__/money.test.ts
frontend/src/domain/__tests__/operations.test.ts
frontend/src/domain/__tests__/report.test.ts
frontend/src/domain/money.ts
frontend/src/domain/operations.ts
frontend/src/domain/report.ts
frontend/src/domain/types.ts
frontend/src/features/accounts/AccountsPage.tsx
frontend/src/features/categories/CategoriesPage.tsx
frontend/src/features/operations/OperationsPage.tsx
frontend/src/features/report/ReportPage.tsx
frontend/src/features/report/export.ts
frontend/src/features/settings/SettingsPage.tsx
frontend/src/main.tsx
frontend/src/state/AppProvider.tsx
frontend/src/state/appContext.ts
frontend/src/styles.css
frontend/src/ui/EmptyState.tsx
frontend/src/ui/Field.tsx
frontend/src/ui/Modal.tsx
frontend/tsconfig.json
frontend/vite.config.ts
frontend/vitest.config.ts
server/eslint.config.js
server/openapi/openapi.yaml
server/package-lock.json
server/package.json
server/src/__tests__/app.test.ts
server/src/app.ts
server/src/domain/errors.ts
server/src/domain/types.ts
server/src/index.ts
server/src/repositories/index.ts
server/src/routes/index.ts
server/src/routes/notImplemented.ts
server/src/services/index.ts
server/tsconfig.json
specifiacation/index.md (удалён — опечатка в имени каталога)
specification/index.md
specification/increment/index.md
specification/increment/develop/index.md
specification/increment/develop/T-1/index.md
specification/increment/develop/T-1/increment.md
specification/increment/develop/T-1/intent.md
```

## Находки

### 1. Удаление счёта-источника перевода зачисляет сумму перевода на счёт-получателя
<!-- id: frontend/src/domain/operations.ts:11:Вклад перевода в остаток счёта не учитывает, что счёт-источник удалён -->
**Файл:** `frontend/src/domain/operations.ts:11` (взаимодействие с `frontend/src/data/localStorageRepository.ts:63`)
**Проблема:** `effectOnAccount` для перевода смотрит только на `accountId`/`targetAccountId` и никак не
учитывает, что счёт мог быть удалён. При удалении счёта `LocalStorageRepository.removeAccount` обнуляет
`accountId`/`targetAccountId` только у операций, где счёт был источником или получателем, — то есть у
перевода удаляется только одна из двух сторон. Оставшаяся сторона продолжает давать вклад в остаток:
- удалён **источник** → `accountId = null`, `targetAccountId` цел → вклад перевода в остаток
  получателя равен `+amount` (деньги появляются из ниоткуда);
- удалён **получатель** → `targetAccountId = null`, `accountId` цел → вклад в остаток источника равен
  `−amount` (деньги исчезают).

План инкремента прямо фиксирует обратное правило: «Операции, потерявшие привязку к удалённому счёту или
категории, не влияют на остатки», и «Удаление справочника не удаляет операции».

**Сценарий:** счёт «Карта» (начальный остаток 1000) и счёт «Вклад» (0). Перевод 500 с «Карты» на «Вклад»
→ остатки: Карта 500, Вклад 500. Пользователь удаляет счёт «Карта». Остаток «Вклада» становится 500 ₽
(вклад перевода), хотя денег на «Карте» уже нет и перевода как такового больше не существует; сумма всех
остатков по счётам выросла на 500 ₽. Проверено на реальном коде: `effectOnAccount(op, 'B')` для
`op = {type:'transfer', accountId: null, targetAccountId:'B', amount: 50000}` возвращает `50000`.

### 2. Фильтр операций по счёту не показывает переводы, где счёт — получатель
<!-- id: frontend/src/features/operations/OperationsPage.tsx:78:Фильтр по счёту сравнивает только с accountId операции -->
**Файл:** `frontend/src/features/operations/OperationsPage.tsx:78`
**Проблема:** фильтр по счёту отбирает операции только по `operation.accountId`:
`!filterAccount || operation.accountId === filterAccount`. Для перевода `accountId` — это счёт-источник,
поэтому переводы, в которых выбранный счёт является **получателем**, из выборки выпадают, а в таблице
колонки «Счёт» они отображаются как «Наличные → Вклад».

**Сценарий:** у пользователя есть перевод 500 ₽ с «Карты» на «Вклад». Он ставит фильтр «Счёт = Вклад» и
видит пустую таблицу, хотя по этому счёту движение денег было — расхождение с остатком счёта и с
разбивкой отчёта «По счетам», где такие переводы учитываются в колонке «Переводы в».

## Второстепенные замечания

Не блокируют мерж.

- `frontend/src/features/accounts/AccountsPage.tsx:64` — начальный остаток разбирается через
  `Number(value.replace(',', '.'))`, в отличие от сумм операций (`parseAmountToMinor`), где допускаются
  пробелы-разделители тысяч. Ввод «1 234,56» приводит к `NaN` и ошибке «Начальный остаток должен быть
  числом» вместо разбора суммы. Также `Math.round(value * 100)` на float даёт ошибку в минорной единице:
  ввод «1,005» сохраняется как 1.00 ₽ вместо 1.01 ₽ (`1.005 * 100 === 100.49999999999999`).
- `frontend/src/features/operations/OperationsPage.tsx:302` — при смене типа операции в форме не сбрасывается
  ранее выбранная категория. При переходе «доход → расход» значение `<select>` перестаёт существовать в
  списке (поле выглядит пустым), но в состоянии остаётся категория старого вида, и сохранение без явного
  выбора даёт сообщение «Категория не соответствует типу операции» вместо «Выберите категорию».
- `frontend/src/features/report/export.ts:338` — CSV собирается конкатенацией без экранирования: `;` и
  `"` в названиях категорий/счетов (названия задаёт пользователь) ломают колонки. Стоит оборачивать поля в
  кавычки по RFC 4180.
- `frontend/src/features/report/export.ts:320` — `URL.revokeObjectURL(url)` вызывается сразу после
  `link.click()`, а `<a>` не добавляется в DOM. В Firefox загрузка файла может отмениться; безопаснее
  добавлять ссылку в документ и отзывать URL по таймауту.
- `frontend/src/features/report/ReportPage.tsx:208` — в таблице «По счетам» не выводится колонка «Итог»,
  хотя `AccountRow.net` считается и выгружается в CSV/Excel. В самой таблице итогов есть строка «Итог»,
  так что расхождение заметно.
- `frontend/src/domain/report.ts:181` — операции с удалённой категорией (`categoryId` не `null`) и операции
  без категории (`categoryId === null`) попадают в разные строки отчёта, но обе называются «Без категории»
  — визуально неразличимы. Аналогично для счетов.
- `frontend/src/features/operations/OperationsPage.tsx:198` — в фильтрах нет варианта «Без категории» /
  «Без счёта», поэтому отвязанные от справочников операции нельзя выбрать фильтром.
- `frontend/src/data/localStorageRepository.ts:119` — `clearAll()` нигде не используется (мёртвый код),
  при этом комментарий говорит «используется в настройках» — настроек сброса нет.
- `frontend/src/domain/report.ts:63` — даты считаются в UTC (`toISOString`), поэтому у пользователя в
  не-UTC часовом поясе граница суток и «текущий месяц» смещаются на день.
- `specification/increment/index.md:3` — ссылка `[develop](../develop/index.md)` ведёт в
  `specification/develop/index.md`, которого нет; фактический индекс лежит в
  `specification/increment/develop/index.md`.

## Итог

Требует доработки — обе находки ломают корректность учёта остатков по счетам (находка 1) и ведут себя
несогласованно с отчётом (находка 2). Сборка, lint и все 48 тестов (44 frontend + 4 server) проходят,
план инкремента в целом реализован: доменный слой, слой хранения, экраны, экспорт CSV/Excel, серверный
каркас и OpenAPI-контракт присутствуют, расхождений с планом сверх находки 1 не выявлено.
