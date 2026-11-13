# Java — правила написания кода

[← Назад](../index.md)

Правила для backend-модулей проекта AgentOrchestra (Java 21, Spring Boot 4.1.0,
Maven multi-module). Правила сгруппированы по сути, не по модулю — файл
применим везде, где есть соответствующий слой или объект.

## Правила

- [dto.md](dto.md) — именование DTO и обязательные аннотации
- [entity.md](entity.md) — наследование BaseEntity, аудит
- [lombok.md](lombok.md) — Lombok для уменьшения шаблонного кода
- [layered-architecture.md](layered-architecture.md) — слои
  controller/service/repository/mapper
- [controllers.md](controllers.md) — реализация в `controller/`, интерфейс в
  `controller/api/` со Swagger
- [mapstruct.md](mapstruct.md) — MapStruct-мапперы
- [liquibase.md](liquibase.md) — миграции БД
