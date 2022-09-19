import { topologicalSort } from './common';
import { Plugin } from './impl';
import { PluginConfigItem, PluginMap, PluginType } from './types';

export class PluginFactory {
  static async create(name: string, item: PluginConfigItem): Promise<PluginType> {
    const pluginInstance = new Plugin(name, item);
    await pluginInstance.init();
    return pluginInstance;
  }

  static async createFromConfig(config: Record<string, PluginConfigItem>): Promise<PluginType[]> {
    const pluginInstanceMap: PluginMap = new Map();
    for (const [name, item] of Object.entries(config)) {
      const pluginInstance = await PluginFactory.create(name, item);
      if (pluginInstance.enable) {
        pluginInstanceMap.set(name, pluginInstance);
      }
    }
    let pluginDepEdgeList: [string, string][] = [];
    // Topological sort plugins
    for (const [_name, pluginInstance] of pluginInstanceMap) {
      pluginInstance.checkDepExisted(pluginInstanceMap);
      pluginDepEdgeList = pluginDepEdgeList.concat(pluginInstance.getDepEdgeList());
    }
    const pluginSortResult: string[] = topologicalSort(pluginInstanceMap, pluginDepEdgeList);
    if (pluginSortResult.length !== pluginInstanceMap.size) {
      const diffPlugin = [...pluginInstanceMap.keys()].filter(name => !pluginSortResult.includes(name));
      throw new Error(`There is a cycle in the dependencies, wrong plugin is ${diffPlugin.join(',')}.`);
    }
    return pluginSortResult.map(name => pluginInstanceMap.get(name)!);
  }
}
