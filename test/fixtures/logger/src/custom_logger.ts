import { Injectable } from '../../../../src';
import { BaseLogger } from '../../../../src/logger/base';

@Injectable()
export default class CustomLogger extends BaseLogger {
  public info(message: string, ...args: any[]): void {
    console.info('[Custom]', message, ...args);
  }
}