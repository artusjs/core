import { Inject, Injectable, ScopeEnum } from '@artus/injection';
import CustomLogger from './custom_logger';

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class TestCustomLoggerClazz {
  @Inject()
  private logger!: CustomLogger;

  public testInfo(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  public testError(message: string | Error, ...args: any[]) {
    this.logger.error(message, ...args);
  }
}
