# Entity

[← Назад](index.md)

- Все entity наследуют `BaseEntity` (UUID `id` + поля `createdAt`/`updatedAt`)
- `@EnableJpaAuditing` включён в application-классе модуля — отдельные
  `@CreatedDate`/`@LastModifiedDate` на entity не нужны, аудит-поле заполняются
  автоматически
- Имя таблицы — `snake_case` во единственном числе (`tasks`, `task_comments`,
  `agent_profiles`)
- Имя Java-класса — `singular` в единственном числе и содержит суффикс `Entity` (`TaskEntity`, `TaskCommentEntity`,
  `AgentProfileEntity`)