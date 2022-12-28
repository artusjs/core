import 'reflect-metadata';
import path from 'path';
import { Container, LoaderFactory } from '../src';
import { ARTUS_SERVER_ENV } from '../src/constant';

const loaderFactory: LoaderFactory = new LoaderFactory(new Container('mock'));

describe('test/config.test.ts', () => {
  describe('app with config', () => {
    it('should config load on application', async () => {
      process.env[ARTUS_SERVER_ENV] = 'production';
      const { main } = await import('./fixtures/app_with_config/bootstrap');
      const app = await main();
      expect(app.config).toEqual({ name: 'test-for-config', test: 1, arr: [ 4, 5, 6 ] });
      process.env[ARTUS_SERVER_ENV] = undefined;
    });
  });

  describe('app with invalid plugin config', () => {
    it('throw error when config lack field', async () => {
      const filePath = path.resolve(__dirname, './fixtures/invalid_plugin_config/config/plugin.lack.ts');
      expect(async () => {
        await loaderFactory.loadItem({
          path: filePath,
          extname: '.ts',
          filename: 'plugin.lack.ts',
          loader: 'plugin-config',
        });
      }).rejects.toThrowError(new Error(
        `Plugin config item test is invalid, please check your plugin config file ${filePath}, reason: must have required property 'enable'`,
      ));
    });
    it('throw error when config addition field', async () => {
      const filePath =  path.resolve(__dirname, './fixtures/invalid_plugin_config/config/plugin.addition.ts');
      expect(async () => {
        await loaderFactory.loadItem({
          path: filePath,
          extname: '.ts',
          filename: 'plugin.addition.ts',
          loader: 'plugin-config',
        });
      }).rejects.toThrowError(new Error(
        `Plugin config item test is invalid, please check your plugin config file ${filePath}, reason: must NOT have additional properties 'additionalField1,additionalField2'`,
      ));
    });
  });
});
