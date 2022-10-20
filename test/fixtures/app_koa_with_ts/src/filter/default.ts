import { Catch, ExceptionFilterType } from '../../../../../src';

@Catch()
export class MockExceptionFilter implements ExceptionFilterType {
  async catch(_err: Error): Promise<void> {
    // Empty filter
  }
}
