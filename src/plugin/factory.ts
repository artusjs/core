import { BasePlugin } from './base';
import { topologicalSort } from './common';
import { ArtusPlugin } from './impl';
import { PluginConfigItem } from './types';

export class PluginFactory {
  static async create(name: string, item: PluginConfigItem): Promise<BasePlugin> {
    const pluginInstance = new ArtusPlugin(name, item);
    await pluginInstance.init();
    return pluginInstance;
  }

  static async createFromConfigList(config: Map<string, PluginConfigItem[]>): Promise<BasePlugin[]> {
    const pluginInstancesMap: Map<string, BasePlugin[]> = new Map();
    for (const [name, items] of config.entries()) {
      const pluginInstance = await Promise.all(items.map(item => PluginFactory.create(name, item)));
      pluginInstancesMap.set(name, pluginInstance);
    }
    let pluginDepEdgeList: [string, string][] = [];
    // Topological sort plugins
    for (const [_name, pluginInstances] of pluginInstancesMap) {
      for (const pluginInstance of pluginInstances) {
        pluginInstance.checkDepExisted(pluginInstancesMap);
        pluginDepEdgeList = pluginDepEdgeList.concat(pluginInstance.getDepEdgeList());
      }
    }
    const pluginSortResult: string[] = topologicalSort(pluginInstancesMap, pluginDepEdgeList);

    if (pluginSortResult.length !== pluginInstancesMap.size) {
      const diffPlugin = [...pluginInstancesMap.keys()].filter((name) => !pluginSortResult.includes(name));
      throw new Error(`There is a cycle in the dependencies, wrong plugin is ${diffPlugin.join(',')}.`);
    }

    const result: BasePlugin[] = [];
    for (const name of pluginSortResult) {
      result.push(...(pluginInstancesMap.get(name) ?? []));
    }
    return this.filterDuplicatePlugins(result);
  }

  static async createFromConfig(config: Record<string, PluginConfigItem>): Promise<BasePlugin[]> {
    const pluginsConfig: Map<string, PluginConfigItem[]> = new Map();
    for (const [name, pluginConfig] of Object.entries(config)) {
      pluginsConfig.set(name, [pluginConfig]);
    }
    return await this.createFromConfigList(pluginsConfig);
  }

  static filterDuplicatePlugins(plugins: BasePlugin[]): BasePlugin[] {
    const exists: Map<string, boolean> = new Map();
    const filtedPlugins: BasePlugin[] = [];
    for (const plugin of plugins) {
      const key = plugin.importPath;
      if (exists.get(key)) {
        continue;
      }
      exists.set(key, true);
      filtedPlugins.push(plugin);
    }

    return filtedPlugins;
  }
}
