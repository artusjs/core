import { ScopeEnum } from '@artus/injection';
import { Injectable, Inject } from '../../../../src';
import TestServiceB from './testServiceB';

@Injectable({
  id: 'testServiceA',
  scope: ScopeEnum.SINGLETON
})
export default class TestServiceA {

  // @ts-ignore
  @Inject('testServiceB')
  // @ts-ignore
  testServiceB: TestServiceB;

  testMethod () {
    return this.testServiceB.sayHello();
  }
}
