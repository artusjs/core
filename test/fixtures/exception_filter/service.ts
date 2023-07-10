import { Injectable } from '@artus/injection';
import { ArtusStdError } from '../../../src';
import { TestCustomError, TestDefaultInheritError, TestInheritError, TestWrappedError } from './error';

@Injectable()
export default class MockErrorService {

  throw(target: string) {
    switch (target) {
      case "default":
        throw new Error("default error");
      case "custom":
        throw new TestCustomError();
      case "wrapped":
        throw new TestWrappedError();
      case "inherit":
        throw new TestInheritError();
      case "defaultInherit":
        throw new TestDefaultInheritError();
      default:
        throw new ArtusStdError(target);
    }
  }
}
