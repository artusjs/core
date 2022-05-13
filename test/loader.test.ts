import 'reflect-metadata';

import assert from 'assert';
import path from 'path';
import { Container } from '@artus/injection';
import { Application, ArtusInjectEnum, LifecycleManager, LoaderFactory } from '../src';
import ConfigurationHandler from '../src/configuration';

describe('test/loader.test.ts', () => {
  describe('module with ts', () => {
    it('should load module testServiceA.ts and testServiceB.ts', async () => {
      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      // Mock for loader
      const lifecycleManager = new LifecycleManager(null as unknown as Application, container);
      container.set({ id: ArtusInjectEnum.LifecycleManager, value: lifecycleManager });
      container.set({ type: ConfigurationHandler });

      const manifest = require('./fixtures/module-with-ts/src/index').default;
      await loaderFactory.loadManifest(manifest);
      assert((container.get('testServiceA') as any).testMethod() === 'Hello Artus');
    });
  });
  describe('module with js', () => {
    it('should load module testServiceA.js and testServiceB.js', async () => {
      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      // Mock for loader
      const lifecycleManager = new LifecycleManager(null as unknown as Application, container);
      container.set({ id: ArtusInjectEnum.LifecycleManager, value: lifecycleManager });
      container.set({ type: ConfigurationHandler });

      const manifest = require('./fixtures/module-with-js/src/index');
      await loaderFactory.loadManifest(manifest);
      const appProxy = new Proxy({}, {
        get (_target, properName: string) {
          return container.get(properName);
        }
      });
      assert((container.get('testServiceA') as any).testMethod(appProxy) === 'Hello Artus');
    });
  });
  describe('module with custom loader', () => {
    it('should load module test.ts with custom loader', async () => {
      // SEEME: the import&register code need be replaced by scanner at production.
      const { default: TestCustomLoader } = require('./fixtures/module-with-custom-loader/src/loader/test_custom_loader');
      LoaderFactory.register(TestCustomLoader);

      const { default: manifest } = require('./fixtures/module-with-custom-loader/src/index');

      const container = new Container('testDefault');
      const loaderFactory = LoaderFactory.create(container);

      // Mock for loader
      const lifecycleManager = new LifecycleManager(null as unknown as Application, container);
      container.set({ id: ArtusInjectEnum.LifecycleManager, value: lifecycleManager });
      container.set({ type: ConfigurationHandler });

      const loaderName = await loaderFactory.getLoaderName({
        filename: 'testClazz.ts',
        root: path.resolve(__dirname, './fixtures/module-with-custom-loader/src'),
        baseDir: path.resolve(__dirname, './fixtures/module-with-custom-loader/src'),
        configDir: ''
      });
      expect(loaderName).toBe('test-custom-loader');
      jest.spyOn(console, 'log');
      await loaderFactory.loadManifest(manifest);
      expect(console.log).toBeCalledWith('TestCustomLoader.load TestClass');
    });
  });
});
