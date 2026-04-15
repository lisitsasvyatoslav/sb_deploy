# Работа с Design Tokens из Figma

## Быстрый старт

### 1. Получение Figma Access Token

1. Откройте [Figma](https://figma.com)
2. Перейдите в **Settings → Account → Personal Access Tokens**
3. Нажмите **Generate new token**
4. Скопируйте токен

### 2. Настройка

Добавьте в `.env` файл в корне проекта:

```bash
FIGMA_ACCESS_TOKEN=your_figma_token_here
FIGMA_FILE_KEY=NiGIiIpK82v6Ky1EAAR9jY
```

### 3. Получение токенов

```bash
cd frontend
npm run update-tokens
```

Скрипт:
- Подключится к Figma Variables API
- Скачает и резолвит все Variables из файла
- Сгенерирует файлы в `frontend/tokens/`
- Tailwind автоматически подхватывает изменения

### 4. Список доступных коллекций

```bash
npm run update-tokens -- --list
```

## Структура токенов

```
frontend/
├── tokens.config.js          # Конфигурация: какие коллекции импортировать
└── tokens/
    ├── colors.js              # Цветовые палитры (Color Base)
    ├── typography.js          # Шрифты, размеры (desktop/mobile), веса
    ├── sizes.js               # Spacing + border radius
    ├── light-theme.js         # Семантические токены (Light)
    ├── dark-theme.js          # Семантические токены (Dark)
    ├── theme-variables.css    # CSS переменные для auto light/dark
    └── index.js               # Re-export для tailwind.config.js
```

## Ссылки

- **Figma REST API Docs**: https://www.figma.com/developers/api

## Troubleshooting

### Ошибка 403 (Forbidden)
- Проверьте правильность `FIGMA_ACCESS_TOKEN`
- Убедитесь, что у токена есть доступ к файлу

### Ошибка 404 (Not Found)
- Проверьте File Key: `FIGMA_FILE_KEY` в `.env`

### Переменные не найдены
- Убедитесь, что в Figma файле созданы Variables
- Проверьте, что Variables находятся в режиме Local
