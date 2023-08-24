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
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
      };
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig);
      expect(pluginList.length).toEqual(3);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(Plugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(pluginList.map(plugin => plugin.name)).toStrictEqual(['plugin-c', 'plugin-b', 'plugin-a']);
    });

    it('should not load plugin with wrong order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-wrong-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-wrong-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_wrong_b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
      };
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig);
      }).rejects.toThrowError(new Error(`Circular dependency found in plugins: plugin-wrong-a, plugin-wrong-b`));
    });

    it('should throw if dependencies missing', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
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
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-b': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
      };
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig);
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependency: plugin-b.`));
    });

    it('should not throw if optional dependence missing', async () => {
      const mockPluginConfig = {
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_d/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
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
        'plugin-c': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_d`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_d/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
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
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_d/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin_c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin_c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            },
          },
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
