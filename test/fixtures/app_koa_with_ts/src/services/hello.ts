import 'reflect-metadata';
import { Inject, Injectable, ScopeEnum } from '@artus/injection';

@Injectable({
  scope: ScopeEnum.EXECUTION,
})
export default class HelloService {
  @Inject('headers')
  headers: Record<string, any>;

  public getTestHeaders() {
    return {
      'x-hello-artus': this.headers['x-hello-artus'],
    };
  }
}