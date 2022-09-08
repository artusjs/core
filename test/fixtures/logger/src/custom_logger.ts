import { Injectable, Logger, ScopeEnum } from '../../../../src';

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class CustomLogger extends Logger {
  public info(message: string, ...args: any[]): void {
    console.info('[Custom]', message, ...args);
  }
}