import { ScopeEnum } from '@artus/injection';
import { Injectable } from '../../../../src';

@Injectable({
  id: 'testServiceB',
  scope: ScopeEnum.SINGLETON
})
export default class TestServiceB {
  sayHello () {
    return 'Hello Artus';
  }
}
