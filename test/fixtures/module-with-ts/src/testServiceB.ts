import { injectable } from '../../../../src';

@injectable('testServiceB')
export default class TestServiceB {
  sayHello () {
    return 'Hello Artus';
  }
}
