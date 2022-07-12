import 'reflect-metadata';
import { Injectable, ScopeEnum } from '@artus/injection';

@Injectable({
  scope: ScopeEnum.EXECUTION
})
export default class NotToBeScannedController {
  async index () {
    return {
      status: 200,
      content: 'Hello Artus'
    };
  }
}