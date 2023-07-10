import { ArtusStdError, Catch, Inject } from '../../../src';
import { ExceptionFilterType } from '../../../src/exception/types';
import { TestBaseError, TestCustomError, TestWrappedError } from './error';

@Catch()
export class TestDefaultExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: Error) {
    this.mockSet.add(err.name);
  }
}

@Catch('APP:TEST_ERROR')
export class TestAppCodeExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: ArtusStdError) {
    this.mockSet.add(err.code);
  }
}

@Catch(TestWrappedError)
export class TestWrappedExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: TestWrappedError) {
    this.mockSet.add(err.code);
  }
}

@Catch(TestCustomError)
export class TestCustomExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: TestCustomError) {
    this.mockSet.add(err.name);
  }
}

@Catch(Error)
export class TestDefaultInheritExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: Error) {
    this.mockSet.add(err.name);
  }
}

@Catch(TestBaseError)
export class TestInheritExceptionHandler implements ExceptionFilterType {
  @Inject('mock_exception_set')
  mockSet: Set<string>;

  async catch(err: TestBaseError) {
    this.mockSet.add(err.name);
  }
}
