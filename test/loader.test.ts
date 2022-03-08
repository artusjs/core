import 'reflect-metadata';

import { Container } from '@artusjs/injection';
import assert from 'assert';
import { LoaderFactory } from '../src';

describe('test/loader/Loader.test.ts', () => {
  describe('module with ts', () => {
    it('should load module testServiceA.ts', async () => {
      const conatiner = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(conatiner);
      const manifest = require('./fixtures/module-with-ts/src/index').default;
      await loaderFactory.loadManifest(manifest);
      assert(conatiner.get('testServiceA').testMethod() === 'Hello Artus');
    });
  });
});
