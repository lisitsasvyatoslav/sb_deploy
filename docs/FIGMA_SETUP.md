# Настройка Figma для получения токенов

## Проверьте, есть ли Variables в Figma файле

1. Откройте файл в Figma Desktop или браузере
2. Нажмите на иконку **Variables** (слева на панели)
   - Или откройте: `View → Variables & Modes` (Alt+Cmd+K)
3. Должны быть созданы **Collections** с переменными:
   - Colors (цвета)
   - Spacing (отступы)
   - Typography (шрифты)
   - Etc.

## Если Variables отсутствуют

Дизайнер создаёт Variables в Figma:
1. Группирует по коллекциям (Colors, Spacing, Typography)
2. Разработчик запускает `npm run update-tokens`
3. Токены автоматически синхронизируются

## Структура Variables в Figma (рекомендуемая)

```
📦 Color Collection
├── RGB/Blue/Solid/50
├── RGB/Blue/Solid/100
├── RGB/Blue/Solid/500
├── ...
├── Gray/Solid/50
├── Gray/Solid/100
└── ...

📦 Spacing Collection
├── Spacing/0
├── Spacing/2
├── Spacing/4
├── ...

📦 Typography Collection
├── Font/Size/12
├── Font/Size/14
├── Font/Line Height/12
└── ...
```

## Текущая ситуация проекта

Figma файл:
```
FIGMA_FILE_KEY=NiGIiIpK82v6Ky1EAAR9jY
```

## Проверка доступа

```bash
cd frontend
npm run update-tokens -- --list
```

Если ошибка 403 → проверьте `FIGMA_ACCESS_TOKEN` в `.env`
Если ошибка 404 → нет доступа к файлу, уточните File Key у команды
