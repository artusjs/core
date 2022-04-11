import 'reflect-metadata';
import path from 'path';
import { ArtusPlugin, PluginFactory } from '../src';

describe('test/app.test.ts', () => {
  describe('app with config', () => {
    it('should load plugin with dep order', async () => {
      const mockPluginConfig = {
        'plugin-a': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-a'),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-b'),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-c'),
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
          path: path.resolve(__dirname, './fixtures/plugin-a'),
        },
        'plugin-b': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-b'),
        },
        'plugin-c': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-c'),
        },
        'plugin-wrong-a': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-wrong-a'),
        },
        'plugin-wrong-b': {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugin-wrong-b'),
        }
      }
      expect(async () => {
        await PluginFactory.createFromConfig(mockPluginConfig)
      }).rejects.toThrowError(new Error(`There is a cycle in the dependencies, wrong plugin is plugin-wrong-a,plugin-wrong-b.`));
    });
  });
});
