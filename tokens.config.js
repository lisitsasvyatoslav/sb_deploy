/**
 * Конфигурация импорта дизайн-токенов из Figma Variables API.
 *
 * Каждая коллекция — это набор переменных в Figma с одним или несколькими modes (вариантами).
 * Скрипт `npm run update-tokens` читает этот конфиг и генерирует файлы в tokens/.
 *
 * Как добавить новую коллекцию:
 *   1. Запустите `npm run update-tokens -- --list` для списка доступных коллекций
 *   2. Добавьте коллекцию в секцию collections ниже
 *   3. Укажите modes (или ['default'] для режима по умолчанию)
 *   4. Укажите output — в какой файл записывать (colors | typography | sizes | themes)
 *   5. Запустите `npm run update-tokens`
 *
 * Remote коллекции (внешние библиотеки):
 *   includeRemote: true — автоматически импортирует ВСЕ remote коллекции
 *   Для точечного контроля: добавьте коллекцию с id и remote: true
 */

module.exports = {
  collections: {
    // === Цвета (примитивы) ===
    'Color Base': {
      modes: ['default'],
      output: 'colors',
    },

    // === Темы (семантические токены) ===
    'Finam': {
      modes: ['Light', 'Dark'],
      output: 'themes',
    },
    'Limex': {
      modes: ['Light', 'Dark'],
      output: 'themes',
    },

    // === Типографика ===
    'Typography': {
      modes: ['Desktop'],
      output: 'typography',
    },

    // === Размеры ===
    'Options': {
      modes: ['default'],
      output: 'sizes',
    },

    // === Настройки иконок (размер + обводка по модам 24/20/16/12) ===
    'Icon Settings': {
      modes: ['24', '20', '16', '12'],
      output: 'icon-settings',
    },

    // Remote коллекции (внешние библиотеки) подхватываются автоматически
    // при includeRemote: true. Для точечного контроля — добавьте сюда с id.
  },

  // Включать remote коллекции (внешние Figma-библиотеки)?
  // false — только локальные коллекции вашего файла.
  // Для точечного импорта: добавьте коллекцию с id и remote: true.
  includeRemote: false,
};
