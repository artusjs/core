import { BaseLogger } from './base';
import { DefineLogger } from './decorator';
import { LoggerLevel } from './level';

@DefineLogger()
export default class ArtusLogger extends BaseLogger {
  constructor() {
    super();
  }

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
}
