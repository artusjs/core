import 'reflect-metadata';
import { ArtusApplication, ArtusStdError, Trigger } from '../src';
import { Input } from '@artus/pipeline';

describe('test/exception_filter.test.ts', () => {
  it('a standard exception catch logic with no filter', async () => {
    try {
      const app = new ArtusApplication();
      const trigger = app.container.get(Trigger);
      trigger.use(() => {
        throw new ArtusStdError('TEST');
      });
      const ctx = await trigger.initContext();
      try {
        await trigger.startPipeline(ctx);
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
      const trigger = app.container.get(Trigger);
      const mockSet: Set<string> = app.container.get('mock_exception_set');
      for (const [inputTarget, exceptedVal] of [
        ['default', 'Error'],
        ['custom', 'TestCustomError'],
        ['wrapped', 'APP:WRAPPED_ERROR'],
        ['APP:TEST_ERROR', 'APP:TEST_ERROR'],
      ]) {
        const input = new Input();
        input.params = {
          target: inputTarget,
        };
        const ctx = await trigger.initContext(input);
        try {
          await trigger.startPipeline(ctx);
        } catch (error) {}
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
