import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';

describe('test/loader/Loader.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      const {
        main,
        app,
        isListening
      } = require('./fixtures/app-koa-with-ts/app');
      await main();
      const testResponse = await axios.get('http://127.0.0.1:3000');
      assert(testResponse.status === 200);
      assert(testResponse.data === 'Hello Artus');
      await app.close();
      assert(!isListening());
    });
  });
});
