# DTO

[← Назад](index.md)

- Имя класса оканчивается на суффикс `Dto` (`TaskResponseDto`,
  `CreateUserDto`, `UpdateProjectDto`) или `Response`/`Request` (`EnrichedTaskResponse`)
- Каждый DTO, отдаваемый или принимаемый через REST, **обязательно** аннотирован
  Swagger (`@Schema`). Без аннотации — DTO не готов к коммиту:
  - на классе — `@Schema(description = "...")`
  - на полях — `@Schema(description = "...")`; для коллекций — `array = true`
  - обязательные поля — `requiredMode = RequiredMode.REQUIRED` (для старых
    версий SpringDoc — `required = true`)
  - enum-поля — `@Schema(implementation = EnumClass.class)` или явный
    `allowableValues = {"A", "B"}`, чтобы Swagger-документация отражала
    конкретные значения, а не строку
  - примеры формата — `example = "..."` для UUID, ISO-дат, ID — там, где
    формат не очевиден из имени поля
- Ответы и запросы — отдельные DTO (не отдавать entity напрямую через REST)