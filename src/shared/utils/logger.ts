// =============================================================================
// FRONTEND LOGGER
// =============================================================================

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARNING: 'warning';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

class FrontendLogger {
  private logToFile(
    level: string,
    module: string,
    message: string,
    data?: unknown
  ) {
    const timestamp = new Date().toISOString();
    // Логируем только в консоль браузера
    // В будущем можно отправлять на сервер:
    // const _logEntry = { timestamp, level, module, message, data: data || null };

    // В браузере отправляем в консоль
    if (typeof window !== 'undefined') {
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

      switch (level) {
        case 'debug':
          console.debug(logMessage, data);
          break;
        case 'info':
          console.info(logMessage, data);
          break;
        case 'warning':
          console.warn(logMessage, data);
          break;
        case 'error':
          console.error(logMessage, data);
          break;
        default:
          console.log(logMessage, data);
      }
    }
  }

  debug(module: string, message: string, data?: unknown) {
    this.logToFile(LOG_LEVELS.DEBUG, module, message, data);
  }

  info(module: string, message: string, data?: unknown) {
    this.logToFile(LOG_LEVELS.INFO, module, message, data);
  }

  warning(module: string, message: string, data?: unknown) {
    this.logToFile(LOG_LEVELS.WARNING, module, message, data);
  }

  warn(module: string, message: string, data?: unknown) {
    this.logToFile(LOG_LEVELS.WARNING, module, message, data);
  }

  error(module: string, message: string, data?: unknown) {
    this.logToFile(LOG_LEVELS.ERROR, module, message, data);
  }
}

export const logger = new FrontendLogger();
