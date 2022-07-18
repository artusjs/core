import 'reflect-metadata';

import assert from 'assert';
import path from 'path';
import { Container } from '@artus/injection';
import { LoaderFactory } from '../src';
import { createApp } from './fixtures/custom_instance/index';
import Custom from './fixtures/custom_instance/custom';

describe('test/loader.test.ts', () => {
  describe('module with ts', () => {
    it('should load module testServiceA.ts and testServiceB.ts', async () => {
      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      const manifest = require('./fixtures/module_with_ts/src/index').default;
      await loaderFactory.loadManifest(manifest);
      assert((container.get('testServiceA') as any).testMethod() === 'Hello Artus');
    });
  });

  describe('module with js', () => {
    it('should load module testServiceA.js and testServiceB.js', async () => {
      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      const manifest = require('./fixtures/module_with_js/src/index');
      await loaderFactory.loadManifest(manifest);
      const appProxy = new Proxy({}, {
        get(_target, properName: string) {
          return container.get(properName);
        },
      });
      assert((container.get('testServiceA') as any).testMethod(appProxy) === 'Hello Artus');
    });
  });

  describe('module with custom loader', () => {
    it('should load module test.ts with custom loader', async () => {
      // SEEME: the import&register code need be replaced by scanner at production.
      const { default: TestCustomLoader } = require('./fixtures/module_with_custom_loader/src/loader/test_custom_loader');
      LoaderFactory.register(TestCustomLoader);

      const { default: manifest } = require('./fixtures/module_with_custom_loader/src/index');

      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      const loaderName = await loaderFactory.findLoaderName({
        filename: 'test_clazz.ts',
        root: path.resolve(__dirname, './fixtures/module_with_custom_loader/src'),
        baseDir: path.resolve(__dirname, './fixtures/module_with_custom_loader/src'),
        configDir: '',
      });
      expect(loaderName).toBe('test-custom-loader');
      jest.spyOn(console, 'log');
      await loaderFactory.loadManifest(manifest);
      expect(console.log).toBeCalledWith('TestCustomLoader.load TestClass');
      expect(console.log).toBeCalledWith('TestCustomLoader.state loaderState');
    });
  });

  describe('custom instance', () => {
    it('should not overide custom instance', async () => {
      const app = await createApp();
      expect(app.container.get(Custom).getName()).toBe('foo');
    });
  });
});
