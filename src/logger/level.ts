export enum LoggerLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
};

export const LOGGER_LEVEL_MAP = {
  [LoggerLevel.TRACE]: 0,
  [LoggerLevel.DEBUG]: 1,
  [LoggerLevel.INFO]: 2,
  [LoggerLevel.WARN]: 3,
  [LoggerLevel.ERROR]: 4,
};
