import 'reflect-metadata';
import path from 'path';
import { ArtusPlugin, PluginFactory } from '../src';

const pluginPrefix = 'fixtures/plugins';

describe('test/app.test.ts', () => {
  describe('app with config', () => {
    it('should load plugin with dep order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
        }
      }
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig);
      expect(pluginList.length).toEqual(3);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(ArtusPlugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(pluginList.map((plugin) => plugin.name)).toStrictEqual(['plugin-c', 'plugin-b', 'plugin-a']);
    });

    it('should not load plugin with wrong order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
        },
        'plugin-wrong-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-a`),
        },
        'plugin-wrong-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-b`),
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`There is a cycle in the dependencies, wrong plugin is plugin-wrong-a,plugin-wrong-b.`));
    });

    it('should throw if dependence missing', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependence: plugin-b.`));
    });

    it('should throw if dependence disabled', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
        },
        'plugin-b': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependence: plugin-b.`));
    });

    it('should not throw if optional dependence missing', async () => {
      const mockPluginConfig = {
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-d`),
        }
      }
      let warnMessage = '';

      // mock warn
      const originWarn = console.warn;
      console.warn = function (msg) {
        warnMessage = msg;
      }
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig);
      expect(pluginList.length).toEqual(1);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(ArtusPlugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(warnMessage === 'Plugin plugin-d need have optional dependence: plugin-e.').toBeTruthy();

      // restore warn
      console.warn = originWarn;
    });
  });
});
