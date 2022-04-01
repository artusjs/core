import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';
import { getArtusApplication } from '../src';
import { ARTUS_SERVER_ENV } from '../src/constraints';

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
        const app = getArtusApplication();
        await main();
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

  describe('app with config', () => {
    it('should config load on application', async () => {
      process.env[ARTUS_SERVER_ENV] = 'production'
      const { main } = await import('./fixtures/app-with-config/app');
      const app = getArtusApplication();
      await main();
      expect(app.config).toEqual({ name: 'test-for-config', test: 1, arr: [ 4, 5, 6 ] })
    });
  });
});
