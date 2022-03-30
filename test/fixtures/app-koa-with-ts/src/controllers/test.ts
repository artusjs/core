import 'reflect-metadata';
import { Injectable } from '@artus/injection';

// TODO: 待实现 Controller/Route 装饰器
@Injectable()
export default class TestController {
  async index () {
    return {
      status: 200,
      content: 'Hello Artus'
    };
  }
}