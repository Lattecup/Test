# MapStruct

[← Назад](index.md)

- Все мапперы — Spring-компоненты: `@Mapper(componentModel = "spring")`
- Один маппер на пару преобразований (entity <-> DTO); если entity <-> несколько
  DTO разной формы — несколько мапперов или методы с `@Mapping`
- Несоответствие имён/типов полей — через `@Mapping(source = "...",
  target = "...")`, не через post-convert в маппере
- Генерируемая реализация лежит в target/classes под именем
  `<MapperName>Impl` (MapStruct + Maven annotation processor)
- В тестах мокать маппер не нужно — он не имеет собственной логики, только
  делегирует сеттерам