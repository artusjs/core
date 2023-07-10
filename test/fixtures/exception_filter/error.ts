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

export class TestDefaultInheritError extends Error {
  name = 'TestDefaultInheritError';
}

export class TestBaseError extends Error {
  name = 'TestBaseError';
}

export class TestInheritError extends TestBaseError {
  name = 'TestInheritError';
}
