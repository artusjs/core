import { Inject } from '@artus/injection';
import { ArtusInjectEnum } from '../constraints';
import { LoggerLevel, LOGGER_LEVEL_MAP } from './level';
import { Logger, LoggerOptions, LogOptions } from './types';

export class BaseLogger implements Logger {

  @Inject(ArtusInjectEnum.Config)
  private appConfig!: Record<string, any>;

  protected get loggerOpts(): LoggerOptions {
    return this.appConfig?.logger ?? {};
  }
  
  protected checkLoggerLevel(level: LoggerLevel) {
    const targetLevel = this.loggerOpts.level ?? LoggerLevel.INFO;
    if (LOGGER_LEVEL_MAP[level] < LOGGER_LEVEL_MAP[targetLevel]) {
      return false;
    }
    return true;
  }

  trace(_message: string, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  debug(_message: string, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  info(_message: string, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  warn(_message: string, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  error(_message: string|Error, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  log({
    level,
    message,
    args = [],
  }: LogOptions): void {
    if (message instanceof Error) {
      if (level === LoggerLevel.ERROR) {
        return this.error(message, ...args);
      }
      message = message.stack ?? message.message;
    }
    switch (level) {
      case LoggerLevel.TRACE:
        this.trace(message, ...args);
        break;
      case LoggerLevel.DEBUG:
        this.debug(message, ...args);
        break;
      case LoggerLevel.INFO:
        this.info(message, ...args);
        break;
      case LoggerLevel.WARN:
        this.warn(message, ...args);
        break;
      case LoggerLevel.ERROR:
        this.error(message, ...args);
        break;
    }
  }
}
