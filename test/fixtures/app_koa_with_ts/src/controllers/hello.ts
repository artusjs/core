import 'reflect-metadata';
import { Inject, Injectable, ScopeEnum } from '@artus/injection';
import HelloService from '../services/hello';

// TODO: 待实现 Controller/Route 装饰器
@Injectable({
  scope: ScopeEnum.EXECUTION,
})
export default class HelloController {
  @Inject(HelloService)
  helloService: HelloService;

  async index () {
    return {
      status: 200,
      content: 'Hello Artus',
      headers: {
        ...this.helloService?.getTestHeaders(),
      },
    };
  }
}