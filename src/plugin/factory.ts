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

  static async createFromConfig(config: Record<string, PluginConfigItem>): Promise<BasePlugin[]> {
    const pluginInstanceMap: Map<string, BasePlugin> = new Map();
    for (const [name, item] of Object.entries(config)) {
      const pluginInstance = await PluginFactory.create(name, item);
      pluginInstanceMap.set(name, pluginInstance);
    }
    let pluginDepEdgeList: [string, string][] = [];
    // Topological sort plugins
    for (const [_name, pluginInstance] of pluginInstanceMap) {
      pluginInstance.checkDepExisted(pluginInstanceMap);
      pluginDepEdgeList = pluginDepEdgeList.concat(pluginInstance.getDepEdgeList());
    }
    const pluginSortResult: string[] = topologicalSort(pluginInstanceMap, pluginDepEdgeList);
    return pluginSortResult.map((name) => pluginInstanceMap.get(name)!);
  }
}
