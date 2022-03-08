import 'reflect-metadata';

import { Container } from '@artusjs/injection';
import assert from 'assert';
import { LoaderFactory } from '../src';

describe('test/loader/Loader.test.ts', () => {
  describe('module with manifest', () => {
    it('should load module tesetService.ts', async () => {
      const conatiner = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(conatiner);
      const manifest = require('./fixtures/module-with-manifest/index').default;
      await loaderFactory.loadManifest(manifest);
      assert(conatiner.get('testService').testMethod() === 'Hello Artus');
    });
  });
});
