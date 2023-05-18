import { Injectable } from '@artus/injection';
import { ArtusStdError } from '../../../src';
import { TestCustomError, TestWrappedError } from './error';

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
      default:
        throw new ArtusStdError(target);
    }
  }
}
