import 'reflect-metadata';
import { ArtusStdError, matchExceptionFilter } from '../src';
import MockErrorService from './fixtures/exception_filter/service';

describe('test/exception_filter.test.ts', () => {
  it('a standard exception catch logic with no filter', async () => {
    try {
      try {
        throw new ArtusStdError('TEST');
      } catch (error) {
        expect(error).toBeInstanceOf(ArtusStdError);
      }
    } catch (error) {
      throw error;
    }
  });
  it('exception should pass their filter', async () => {
    try {
      const {
        main,
      } = await import('./fixtures/exception_filter/bootstrap');

      const app = await main();
      const mockSet: Set<string> = app.container.get('mock_exception_set');
      for (const [inputTarget, exceptedVal] of [
        ['default', 'Error'],
        ['custom', 'TestCustomError'],
        ['wrapped', 'APP:WRAPPED_ERROR'],
        ['APP:TEST_ERROR', 'APP:TEST_ERROR'],
        ['inherit', 'TestInheritError'],
        ['defaultInherit', 'TestDefaultInheritError'],
      ]) {
        const mockErrorService = app.container.get(MockErrorService);
        try {
          mockErrorService.throw(inputTarget);
        } catch (error) {
          const filter = matchExceptionFilter(error, app.container);
          await filter.catch(error);
        }
        expect(mockSet.has(exceptedVal)).toBeTruthy();
      }
    } catch (error) {
      throw error;
    }
  });
  it('should throw error then filter is invalid', async () => {
    try {
      const {
        main,
      } = await import('./fixtures/exception_invalid_filter/bootstrap');

      expect(() => main()).rejects.toThrow(new Error(`invalid ExceptionFilter TestInvalidFilter`));
    } catch (error) {
      throw error;
    }
  });
});
