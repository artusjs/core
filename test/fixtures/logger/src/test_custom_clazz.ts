import { Inject, Injectable } from '@artus/injection';
import CustomLogger from './custom_logger';

@Injectable()
export default class TestCustomLoggerClazz {
  @Inject()
  private logger!: CustomLogger;

  public testInfo(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  public testError(message: string|Error, ...args: any[]) {
    this.logger.error(message, ...args);
  }
}
