# Liquibase — миграции БД

[← Назад](index.md)

- Все миграции — через Liquibase (`changelog-master.xml` модуля + SQL-файлы в
  `src/main/resources/db/changelog/`)
- Каждый SQL-файл начинается с formatted SQL header:
  ```sql
  --liquibase formatted sql
  --changeset author:id description="..."
  ```
- Идемпотентность не требуется — Liquibase сам отслеживает применённые
  changeset'ы; `IF NOT EXISTS`/`IF EXISTS` в миграциях обычно не нужен
- Один changeset = одно логическое изменение (создать таблицу, добавить
  колонку, создать индекс)
- Идентификатор changeset'а уникален в пределах модуля; не переиспользовать id
  между разными файлами
- Новый changeset всегда добавляется в конец `changelog-master.xml` — не
  править уже применённые файлы