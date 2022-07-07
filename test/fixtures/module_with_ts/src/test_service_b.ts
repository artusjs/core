import { ScopeEnum, Injectable } from '@artus/injection';

@Injectable({
  id: 'testServiceB',
  scope: ScopeEnum.SINGLETON,
})
export default class TestServiceB {
  sayHello() {
    return 'Hello Artus';
  }
}
