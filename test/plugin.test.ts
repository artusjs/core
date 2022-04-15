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
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
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
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-wrong-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-wrong-b': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-wrong-b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`There is a cycle in the dependencies, wrong plugin is plugin-wrong-a,plugin-wrong-b.`));
    });

    it('should throw if dependencies missing', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependencies: plugin-b.`));
    });

    it('should throw if dependencies disabled', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-a`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-a/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-b': {
          enable: false,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-b`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-b/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-c`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-c/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`Plugin plugin-a need have dependencies: plugin-b.`));
    });

    it('should not throw if optional dependencies missing', async () => {
      const mockPluginConfig = {
        'plugin-d': {
          enable: true,
          path: path.resolve(__dirname, `${pluginPrefix}/plugin-d`),
          manifest: {
            pluginMeta: {
              path: path.resolve(__dirname, `${pluginPrefix}/plugin-d/meta.js`),
              extname: '.js',
              filename: 'meta.js',
            }
          }
        }
      }

      // mock warn
      const originWarn = console.warn;
      const mockWarnFn = jest.fn();
      console.warn = mockWarnFn;
      const pluginList = await PluginFactory.createFromConfig(mockPluginConfig);
      expect(pluginList.length).toEqual(1);
      pluginList.forEach(plugin => {
        expect(plugin).toBeInstanceOf(ArtusPlugin);
        expect(plugin.enable).toBeTruthy();
      });
      expect(mockWarnFn).toBeCalledWith(`Plugin plugin-d need have optional dependencies: plugin-e.`);

      // restore warn
      console.warn = originWarn;
    });
  });
});
