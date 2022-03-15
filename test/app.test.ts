import 'reflect-metadata';
import assert from 'assert';

describe('test/loader/Loader.test.ts', () => {
  describe('app koa with ts', () => {
    it('should run app', async () => {
      const mainFunction = require('./fixtures/app-koa-with-ts/app').default;
      await mainFunction();
      assert(true);
    });
  });
});
