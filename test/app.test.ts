import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';

describe('test/app.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      // Skip Controller
      const TestController = await import('./fixtures/app-koa-with-ts/src/controllers/test');
      assert(TestController);
      expect(await new TestController.default().index()).toStrictEqual({
        content: 'Hello Artus',
        status: 200
      });

      try {
        const {
          main,
          isListening
        } = await import('./fixtures/app-koa-with-ts/src/bootstrap');
        const app = await main();
        const testResponse = await axios.get('http://127.0.0.1:3000');
        assert(testResponse.status === 200);
        assert(testResponse.data === 'Hello Artus');
        await app.close();
        assert(!isListening());
      } catch (error) {
        throw error;
      }
    });
  });
});
