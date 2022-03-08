import { injectable, inject } from '../../../../src';
import TestServiceB from './testServiceB';

@injectable('testServiceA')
export default class TestServiceA {

  // @ts-ignore
  @inject('testServiceB')
  // @ts-ignore
  testServiceB: TestServiceB;

  testMethod () {
    return this.testServiceB.sayHello();
  }
}
