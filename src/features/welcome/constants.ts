/**
 * Configuration constants for the welcome chat experience.
 * These control the limited AI chat for unauthenticated users.
 */

export const WELCOME_CHAT_CONFIG = {
  /**
   * Maximum number of messages an unauthenticated user can send.
   * After this limit, they will be prompted to sign up.
   */
  MAX_USER_MESSAGES: 3,

  /**
   * Maximum tokens for AI response in welcome chat.
   * Limited to keep responses concise and manage costs.
   */
  MAX_TOKENS: 1500,

  /**
   * Model to use for welcome chat responses.
   * Preselected for consistent experience.
   */
  MODEL: 'litellm/gpt-5-mini',
} as const;

/**
 * LocalStorage keys used in the welcome flow.
 */
export const WELCOME_STORAGE_KEYS = {
  PENDING_MESSAGE: 'welcome_pending_message',
  SEED_CHAT_PAYLOAD: 'welcome_seed_chat_payload',
  DEMO_SPARKLE_CONTEXT: 'demo_sparkle_context',
} as const;

/**
 * Message shown to user after they reach the message limit.
 */
export const WELCOME_SIGNUP_PROMPT =
  'Чтобы продолжить общение с AI-ассистентом и получить доступ ко всем функциям платформы, пожалуйста, зарегистрируйтесь.';

/**
 * Message appended to chat after successful signup.
 */
export const WELCOME_AFTER_SAVE_TEXT = `Отлично, теперь диалоги будут сохраняться в вашей учетной записи. Также, обращаем ваше внимание, что мы создали для вас рабочие пространства:

**Обзор** - здесь сводка, дашборд  

**Портфель** - здесь ваш портфель, рекомендации по управлению, важные инсайты и алерты  

**Стратегии** - это пространство нацелено на поиск новых трейдинговых идей и стратегий  

**Идеи** - здесь торговые и инвестиционные идеи, которые в проработке и проверке  

**Исполнение** - здесь ваши заявки/ордера отправленные на биржу или брокеру  

**Обучение** - здесь все, что нужно, чтобы вы научились эффективно торговать и инвестировать  

Понятны ли вам эти разделы?`;

/**
 * Slug-based routing for welcome suggestion buttons.
 * Maps URL slugs to suggestion texts for /welcome/[slug] pages.
 */
export const WELCOME_SLUGS = [
  {
    slug: 'ofz-bonds-btc',
    text: 'Каждый раз, когда ФРС печатает деньги, золото становится дороже. А они не останавливаются',
  },
  {
    slug: 'risk-management-strategy',
    text: 'Создайте стратегию управления рисками для моего торгового портфеля',
  },
  {
    slug: 'market-trends-analysis',
    text: 'Анализируйте текущие рыночные тренды и определяйте потенциальные торговые возможности',
  },
];

export function getSlugConfig(slug: string) {
  return WELCOME_SLUGS.find((s) => s.slug === slug);
}

export function getSlugByText(text: string) {
  return WELCOME_SLUGS.find((s) => s.text === text)?.slug;
}
