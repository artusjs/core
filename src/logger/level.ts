export enum LoggerLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
};

export const LOGGER_LEVEL_MAP = {
  [LoggerLevel.TRACE]: 0,
  [LoggerLevel.DEBUG]: 1,
  [LoggerLevel.INFO]: 2,
  [LoggerLevel.WARN]: 3,
  [LoggerLevel.ERROR]: 4,
  [LoggerLevel.FATAL]: 5,
};
