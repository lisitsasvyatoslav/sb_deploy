import type { OnboardingScene } from './types';

/** Constants for the onboarding progress bar */
export const ONBOARDING_DOTS_PER_ROW = 17;
export const ONBOARDING_TOTAL_DOTS = ONBOARDING_DOTS_PER_ROW * 2; // 34 dots across 2 rows

/** Step value that means "all scenes viewed / completed" */
export const ONBOARDING_COMPLETE_STEP = 7;

/** Step value that means "user dismissed the panel" */
export const ONBOARDING_DISMISSED_STEP = -1;

/** Total number of onboarding steps across all scenes (5 + 3 + 3 + 2 + 1 + 2) */
export const ONBOARDING_TOTAL_STEPS = 16;

/** Floating widget resize constraints (px) */
export const WIDGET_MIN_WIDTH = 300;
export const WIDGET_MAX_WIDTH = 600;
export const WIDGET_MIN_HEIGHT = 400;
export const WIDGET_MAX_HEIGHT = 800;

/** Docked widget resize constraints (px) */
export const DOCKED_MIN_WIDTH = 360;
export const DOCKED_MAX_WIDTH = 500;

const VIDEO_BASE = '/images/onboarding/short-cuts';

export const ONBOARDING_SCENES: OnboardingScene[] = [
  // Scene 1 ("КАК ИСПОЛЬЗОВАТЬ ПРОДУКТ") temporarily hidden
  // {
  //   id: 1,
  //   titleKey: 'onboarding.widgetTitle',
  //   titleFallback: 'КАК ИСПОЛЬЗОВАТЬ ПРОДУКТ',
  //   ...
  // },
  {
    id: 2,
    titleKey: 'onboarding.scene2.title',
    titleFallback: 'ЭТО ТВОЙ ЧАТ С ИИ',
    heroImage: '/images/onboarding/slot/preview-card-1.png',
    steps: [
      {
        textKey: 'onboarding.scene2.step1',
        textFallback:
          'Для того, чтобы чат с ИИ работал корректно, нужно пройти небольшую анкету из трёх вопросов.',
        type: 'survey_link',
        highlightTarget: 'survey',
        shortcutVideo: `${VIDEO_BASE}/scene-2/survey.webm`,
      },
      {
        textKey: 'onboarding.scene2.step2',
        textFallback:
          'Это твой чат, где ты сможешь обсуждать с ИИ свои идеи и сделки.',
        highlightTarget: 'chat',
        shortcutVideo: `${VIDEO_BASE}/scene-2/model-selection.webm`,
      },
      {
        textKey: 'onboarding.scene2.step3',
        textFallback:
          'В нем подключены популярные модели, ты можешь их переключать, вот тут.',
        highlightTarget: 'model-selector',
        shortcutVideo: `${VIDEO_BASE}/scene-2/model-selection.webm`,
      },
      {
        textKey: 'onboarding.scene2.step4',
        textFallback:
          'Наш чат — не просто базовая языковая модель, у него внутри много разных инструментов.',
        highlightTarget: 'model-dropdown',
        shortcutVideo: `${VIDEO_BASE}/scene-2/what-can-you-do.webm`,
      },
      {
        textKey: 'onboarding.scene2.step5',
        textFallback:
          'Если интересно, ты всегда можешь его спросить «Что ты умеешь?» И он тебе расскажет.',
        highlightTarget: 'chat-input',
        autoFillMessage: 'Что ты умеешь?',
        shortcutVideo: `${VIDEO_BASE}/scene-2/what-can-you-do.webm`,
      },
    ],
    highlightTarget: 'chat',
    nextLabelKey: 'onboarding.scene2.nextLabel',
    nextLabelFallback: 'Далее: Взаимодействие с чатом',
  },
  {
    id: 3,
    titleKey: 'onboarding.scene3.title',
    titleFallback: 'ВЗАИМОДЕЙСТВИЕ С ЧАТОМ',
    heroImage: '/images/onboarding/slot/preview-card-1.png',
    steps: [
      {
        textKey: 'onboarding.scene3.step1',
        textFallback:
          'Теперь давайте обсудим Ваш вопрос с чатом. Например: «Как сегодня торгуется рынок на MOEX?»',
        highlightTarget: 'chat-input',
        autoFillMessage: 'Как сегодня торгуется рынок на MOEX?',
        shortcutVideo: `${VIDEO_BASE}/scene-3/moex-trading.webm`,
      },
      {
        textKey: 'onboarding.scene3.step2',
        textFallback:
          'Давай спросим информацию об интересующем тебя тикере, например «Какой уровень поддержки и сопротивления у Сбера сегодня?»',
        highlightTarget: 'chat-input',
        autoFillMessage:
          'Какой уровень поддержки и сопротивления у Сбера сегодня?',
        shortcutVideo: `${VIDEO_BASE}/scene-3/sber-trading.webm`,
      },
      {
        textKey: 'onboarding.scene3.step3',
        textFallback:
          'Давайте сохраним это на Ваше первое пространство. Нажмите кнопку «Добавить на доску».',
        highlightTarget: 'save-to-board',
        shortcutVideo: `${VIDEO_BASE}/scene-3/add-to-board.webm`,
      },
    ],
    highlightTarget: 'chat',
    nextLabelKey: 'onboarding.scene3.nextLabel',
    nextLabelFallback: 'Далее: Взаимодействие с доской',
  },
  {
    id: 4,
    titleKey: 'onboarding.scene4.title',
    titleFallback: 'ВЗАИМОДЕЙСТВИЕ С ДОСКОЙ',
    heroImage: '/images/onboarding/slot/preview-card-2.png',
    steps: [
      {
        textKey: 'onboarding.scene4.step1',
        textFallback:
          'Ответ ИИ сохранился на доске. Давайте перейдём туда, чтобы посмотреть.',
        highlightTarget: 'board-or-create',
        shortcutVideo: `${VIDEO_BASE}/scene-4/navigate-to-board.webm`,
      },
      {
        textKey: 'onboarding.scene4.step2',
        textFallback:
          'Это Ваше первое бесконечное пространство. Здесь уже сохранилась Ваша заметка с ответом ИИ.',
        shortcutVideo: `${VIDEO_BASE}/scene-4/enter-board.webm`,
      },
      {
        textKey: 'onboarding.scene4.step3',
        textFallback:
          'Ты можешь добавить любую информацию по тикеру, используя панель инструментов.',
        highlightTarget: 'board-toolbar',
        shortcutVideo: `${VIDEO_BASE}/scene-4/tools.webm`,
      },
    ],
    highlightTarget: 'board',
    nextLabelKey: 'onboarding.scene4.nextLabel',
    nextLabelFallback: 'Далее: Добавление тикера',
  },
  {
    id: 5,
    titleKey: 'onboarding.scene5.title',
    titleFallback: 'ДОБАВЛЕНИЕ ТИКЕРА',
    heroImage: '/images/onboarding/slot/preview-card-2.png',
    steps: [
      {
        textKey: 'onboarding.scene5.step1',
        textFallback:
          'Выбери интересующий тебя тикер: новости, фундаментальные показатели и сигналы по техническому анализу.',
        highlightTarget: 'add-ticker',
        shortcutVideo: `${VIDEO_BASE}/scene-5/ticker-selection.webm`,
      },
      {
        textKey: 'onboarding.scene5.step2',
        textFallback:
          'Добавь на доску. У тебя сформируются на доске карточки с информацией',
        highlightTarget: 'ticker-add-button',
        shortcutVideo: `${VIDEO_BASE}/scene-5/add-ticker.webm`,
      },
    ],
    highlightTarget: 'board',
    nextLabelKey: 'onboarding.scene5.nextLabel',
    nextLabelFallback: 'Далее: Взаимодействие с карточками',
  },
  {
    id: 6,
    titleKey: 'onboarding.scene6.title',
    titleFallback: 'ВЗАИМОДЕЙСТВИЕ С КАРТОЧКАМИ',
    heroImage: '/images/onboarding/slot/preview-card-2.png',
    steps: [
      {
        textKey: 'onboarding.scene6.step1',
        textFallback:
          'Ты можешь отправить эти карточки в чат с ИИ и спросить его мнение, просто выделив одну или несколько карточек и нажав кнопку "Спросить AI". Информация никуда не пропадет из чата, и ты сможешь вернуться к обсуждению с ним своих идей',
        highlightTarget: 'board-toolbar',
        shortcutVideo: `${VIDEO_BASE}/scene-6/card-selection.webm`,
      },
    ],
    highlightTarget: 'board',
    nextLabelKey: 'onboarding.scene6.nextLabel',
    nextLabelFallback: 'Далее: Портфель',
  },
  {
    id: 7,
    titleKey: 'onboarding.scene7.title',
    titleFallback: 'ПОРТФЕЛЬ',
    heroImage: '/images/onboarding/slot/preview-card-3.png',
    steps: [
      {
        textKey: 'onboarding.scene7.step1',
        textFallback:
          'Перейди в раздел портфель и мы добавим информацию по твоему портфелю.',
        highlightTarget: 'portfolio-nav',
        shortcutVideo: `${VIDEO_BASE}/scene-7/navigate-to-portfolio.webm`,
      },
      {
        textKey: 'onboarding.scene7.step2',
        textFallback:
          'Для добавления портфеля создай свое пространство с портфелем и загрузи данные из брокера. После чего ты сможешь эти данные обсудить с чатом. Достаточно спросить его «Что у меня в портфеле?».',
        highlightTarget: 'portfolio-containers',
        shortcutVideo: `${VIDEO_BASE}/scene-7/connect-portfolio.webm`,
      },
    ],
    highlightTarget: 'portfolio',
  },
];
