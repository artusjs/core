import { ArtusStdError } from '../../../src';

export class TestWrappedError extends ArtusStdError {
  static code = 'APP:WRAPPED_ERROR';
  name = 'TestWrappedError';

  constructor() {
    super(TestWrappedError.code);
  }
}

export class TestCustomError extends Error {
  name = 'TestCustomError';
}
