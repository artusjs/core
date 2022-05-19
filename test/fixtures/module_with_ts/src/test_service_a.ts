import { ScopeEnum, Injectable, Inject } from '@artus/injection';
import TestServiceB from './test_service_b';

@Injectable({
  id: 'testServiceA',
  scope: ScopeEnum.SINGLETON
})
export default class TestServiceA {
  @Inject('testServiceB')
  // @ts-ignore
  testServiceB: TestServiceB;

  testMethod() {
    return this.testServiceB.sayHello();
  }
}
