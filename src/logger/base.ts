import { Container, Inject } from '@artus/injection';
import { ArtusInjectEnum } from '../constant';
import { LoggerLevel, LOGGER_LEVEL_MAP } from './level';
import { Logger, LoggerOptions, LogOptions } from './types';

export class BaseLogger implements Logger {

  @Inject()
  private container!: Container;

  protected get loggerOpts(): LoggerOptions {
    const appConfig: Record<string, any> = this.container.get(ArtusInjectEnum.Config);
    return appConfig?.logger ?? {};
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

  fatal(_message: string|Error, ..._args: any[]): void {
    throw new Error('Not implemented');
  }

  log(_opts: LogOptions): void {
    throw new Error('Not implemented');
  }
}
