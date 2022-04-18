import 'reflect-metadata';

import { Container } from '@artus/injection';
import assert from 'assert';
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
});
