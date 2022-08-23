import { Inject, Injectable, ScopeEnum } from '@artus/injection';
import { ArtusLogger, LoggerLevel } from '../../../../src/logger';

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class TestLoggerClazz {
  @Inject()
  private logger!: ArtusLogger;

  public testLog(level: LoggerLevel, message: string | Error, ...splat: any[]) {
    this.logger.log({
      level,
      message,
      splat,
    });
  }

  public testTrace(message: string, ...args: any[]) {
    this.logger.trace(message, ...args);
  }

  public testDebug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }

  public testInfo(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  public testWarn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  public testError(message: string | Error, ...args: any[]) {
    this.logger.error(message, ...args);
  }
}
