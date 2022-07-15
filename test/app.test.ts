import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';
import KoaApplication from './fixtures/app_koa_with_ts/src/koa_app';

describe('test/app.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      // Skip Controller
      const HelloController = await import('./fixtures/app_koa_with_ts/src/controllers/hello');
      assert(HelloController);
      expect(await new HelloController.default().index()).toStrictEqual({
        content: 'Hello Artus',
        status: 200,
        headers: {},
      });

      try {
        const {
          main,
        } = await import('./fixtures/app_koa_with_ts/src/index');
        const app = await main();
        const testResponse = await axios.get('http://127.0.0.1:3000', {
          headers: {
            'x-hello-artus': 'true',
          },
        });
        expect(testResponse.status).toBe(200);
        expect(testResponse.data).toBe('Hello Artus');
        expect(testResponse.headers?.['x-hello-artus']).toBe('true');
        await app.close();

        const koaApp = app.getContainer().get(KoaApplication);
        expect(koaApp.isListening()).toBeFalsy();
      } catch (error) {
        throw error;
      }
    });
  });
});
