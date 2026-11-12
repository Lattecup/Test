# Слоистая архитектура

[← Назад](index.md)

Один feature = один пакет с фиксированным набором слоёв (сверху вниз по потоку
запроса):

```
controller/api/   ← Swagger-интерфейс контроллера (отдельно от реализации)
controller/       ← реализация контроллера
service/api/      ← Javadoc-интерфейс сервиса
service/          ← реализация сервиса
repository/       ← Spring Data JPA репозиторий
mapper/           ← MapStruct-маппер между entity <-> DTO
entity/           ← JPA-сущность
dto/              ← record-DTO
```

- Слой может быть опущен, если в нём нет содержимого; но стандартные слои
  (`controller/`, `service/`, `repository/`, `entity/`, `dto/`) есть всегда,
  даже если класс в слое пока один
- Связь между слоями — только сверху вниз: `repository/` не должен знать про
  `service/`, `entity/` — про `dto/`, `service/` — про Spring MVC и т.п.
- `controller/api/` отделён от `controller/`, чтобы Swagger-схема не
  пересекалась с DI-аннотациями реализации