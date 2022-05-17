import { DefineLogger } from '../../../../src/logger';
import { BaseLogger } from '../../../../src/logger/base';

@DefineLogger()
export default class CustomLogger extends BaseLogger {
  constructor() {
    super();
  }

  public info(message: string, ...args: any[]): void {
    console.info('[Custom]', message, ...args);
  }
}