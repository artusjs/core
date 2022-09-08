import { Injectable } from '@artus/injection';
import { BaseLogger } from './base';
import { LoggerLevel } from './level';
import { LogOptions } from './types';

@Injectable({
  scopeEscape: true
})
export default class Logger extends BaseLogger {
  public trace(message: string, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.TRACE)) {
      return;
    }
    console.trace(message, ...args);
  }

  public debug(message: string, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.DEBUG)) {
      return;
    }
    console.debug(message, ...args);
  }

  public info(message: string, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.INFO)) {
      return;
    }
    console.info(message, ...args);
  }

  public warn(message: string, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.WARN)) {
      return;
    }
    console.warn(message, ...args);
  }

  public error(message: string | Error, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.ERROR)) {
      return;
    }
    console.error(message, ...args);
  }

  public fatal(message: string | Error, ...args: any[]) {
    if (!this.checkLoggerLevel(LoggerLevel.FATAL)) {
      return;
    }
    console.error(message, ...args);
  }

  public log({
    level,
    message,
    splat = [],
  }: LogOptions) {
    if (message instanceof Error) {
      if (level === LoggerLevel.ERROR) {
        return this.error(message, ...splat);
      }
      message = message.stack ?? message.message;
    }
    switch (level) {
      case LoggerLevel.TRACE:
        this.trace(message, ...splat);
        break;
      case LoggerLevel.DEBUG:
        this.debug(message, ...splat);
        break;
      case LoggerLevel.INFO:
        this.info(message, ...splat);
        break;
      case LoggerLevel.WARN:
        this.warn(message, ...splat);
        break;
      case LoggerLevel.ERROR:
        this.error(message, ...splat);
        break;
      case LoggerLevel.FATAL:
        this.fatal(message, ...splat);
        break;
    }
  }
}
