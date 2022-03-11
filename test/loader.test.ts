import 'reflect-metadata';

import { Container } from '@artus/injection';
import assert from 'assert';
import { LoaderFactory } from '../src';

describe('test/loader/Loader.test.ts', () => {
  describe('module with ts', () => {
    it('should load module testServiceA.ts and testServiceB.ts', async () => {
      const conatiner = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(conatiner);
      const manifest = require('./fixtures/module-with-ts/src/index').default;
      await loaderFactory.loadManifest(manifest);
      assert(conatiner.get('testServiceA').testMethod() === 'Hello Artus');
    });
  });
  describe('module with js', () => {
    it('should load module testServiceA.js and testServiceB.js', async () => {
      const conatiner = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(conatiner);
      const manifest = require('./fixtures/module-with-js/src/index');
      await loaderFactory.loadManifest(manifest);
      const appProxy = new Proxy({}, {
        get (_target, properName: string) {
          return conatiner.get(properName);
        }
      });
      assert(conatiner.get('testServiceA').testMethod(appProxy) === 'Hello Artus');
    });
  });
});
