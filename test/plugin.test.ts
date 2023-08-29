import 'reflect-metadata';
import path from 'path';
import { Logger, Plugin, PluginFactory } from '../src';

const pluginPrefix = 'fixtures/plugins';

describe('test/plugin.test.ts', () => {
  describe('app with config', () => {
    it('should load plugin with dep order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
        },
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
        },
      };
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig);
      expect(pluginList.length).toEqual(4);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(Plugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(pluginList.map(plugin => plugin.name)).toStrictEqual(['plugin-c', 'plugin-b', 'plugin-a', 'plugin-d']);
    });

    it('should not load plugin with wrong order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
        },
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
        },
        'plugin-wrong-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_a`),
        },
        'plugin-wrong-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_b`),
        },
      };
      await expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig);
      }).rejects.toThrowError(new Error(`Circular dependency found in plugins: plugin-wrong-a, plugin-wrong-b`));
    });

    it('should throw if dependencies missing', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
        },
      };
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig);
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependency: plugin-b.`));
    });

    it('should throw if dependence disabled', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
        },
        'plugin-b': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
        },
      };
      await expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig);
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependency: plugin-b.`));
    });

    it('should not throw if optional dependence missing', async () => {
      const mockPluginConfig = {
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
        },
      };

      // mock warn
      const originWarn = console.warn;
      const mockWarnFn = jest.fn();
      console.warn = mockWarnFn;
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig, {
        logger: new Logger(),
      });
      expect(pluginList.length).toEqual(1);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(Plugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(mockWarnFn).toBeCalledWith(`Plugin plugin-d need have optional dependency: plugin-c.`);

      // restore warn
      console.warn = originWarn;
    });

    it('should not throw if optional dependence disabled', async () => {
      const mockPluginConfig = {
        'plugin-b': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
        },
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
        },
      };

      // mock warn
      const originWarn = console.warn;
      const mockWarnFn = jest.fn();
      console.warn = mockWarnFn;
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig, {
        logger: new Logger(),
      });
      expect(pluginList.length).toEqual(1);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(Plugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(mockWarnFn).toBeCalledWith(`Plugin plugin-d need have optional dependency: plugin-c.`);

      // restore warn
      console.warn = originWarn;
    });

    it('should calc order if optional dependence enabled', async () => {
      const mockPluginConfig = {
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
        },
      };

      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig, {
        logger: new Logger(),
      });
      expect(pluginList.length).toEqual(2);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(Plugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(pluginList.map(plugin => plugin.name)).toStrictEqual(['plugin-c', 'plugin-d']);
    });
  });
});
