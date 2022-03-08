import { injectable } from '../../../../src';

@injectable('testService')
export default class TestService {
  testMethod () {
    return 'Hello Artus';
  }
}
