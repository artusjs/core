import { ScopeEnum } from '@artus/injection';
import { Injectable, Inject } from '../../../../src';
import TestServiceB from './test_service_b';

@Injectable({
  id: 'testServiceA',
  scope: ScopeEnum.SINGLETON
})
export default class TestServiceA {
  @Inject('testServiceB')
  // @ts-ignore
  testServiceB: TestServiceB;

  testMethod () {
    return this.testServiceB.sayHello();
  }
}
