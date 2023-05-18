import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';
import { ArtusApplication, ArtusInjectEnum, ConfigurationHandler, LifecycleManager, LoaderFactory } from '../src';

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
          app,
          main,
          isListening,
        } = await import('./fixtures/app_koa_with_ts/src/bootstrap');

        // Check Artus Default Class Inject to Contianer
        expect(app.container.get(ArtusInjectEnum.Application)).toBeInstanceOf(ArtusApplication);
        expect(app.container.get(LifecycleManager)).toBeInstanceOf(LifecycleManager);
        expect(app.container.get(LoaderFactory)).toBeInstanceOf(LoaderFactory);
        expect(app.container.get(ConfigurationHandler)).toBeInstanceOf(ConfigurationHandler);

        await main();
        
        const testResponse = await axios.get('http://127.0.0.1:3000', {
          headers: {
            'x-hello-artus': 'true',
          },
        });
        expect(testResponse.status).toBe(200);
        expect(testResponse.data).toBe('Hello Artus');
        expect(testResponse.headers?.['x-hello-artus']).toBe('true');
        await app.close();
        expect(isListening()).toBeFalsy();
      } catch (error) {
        throw error;
      }
    });
  });
});
