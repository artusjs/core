import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';
import { getArtusApplication } from '../src';
import { ARTUS_SERVER_ENV } from '../src/constraints';

describe('test/app.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      const {
        main,
        isListening
      } = await import('./fixtures/app-koa-with-ts/app');
      const app = getArtusApplication();
      await main();
      const testResponse = await axios.get('http://127.0.0.1:3000');
      assert(testResponse.status === 200);
      assert(testResponse.data === 'Hello Artus');
      await app.close();
      assert(!isListening());
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
