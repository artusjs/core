import { sortPlugins } from './common';
import { Plugin } from './impl';
import { PluginConfigItem, PluginCreateOptions, PluginMap, PluginType } from './types';

export class PluginFactory {
  static async createFromConfig(config: Record<string, PluginConfigItem>, opts?: PluginCreateOptions): Promise<PluginType[]> {
    const pluginInstanceMap: PluginMap = new Map();
    for (const [name, item] of Object.entries(config)) {
      if (item.enable) {
        const pluginInstance = new Plugin(name, item);
        await pluginInstance.init();
        pluginInstanceMap.set(name, pluginInstance);
      }
    }
    return sortPlugins(pluginInstanceMap, opts?.logger);
  }
}
