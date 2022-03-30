import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';
import { getArtusApplication } from '../src';

describe('test/app.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      try {
        const {
          main,
          isListening
        } = await import('./fixtures/app-koa-with-ts/bootstrap');
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
});
