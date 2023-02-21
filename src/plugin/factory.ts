import path from 'path';
import { ManifestItem } from '../loader';
import { getInlinePackageEntryPath, getPackagePath, topologicalSort } from './common';
import { Plugin } from './impl';
import { PluginConfigItem, PluginCreateOptions, PluginMap, PluginType } from './types';
import { exists } from '../utils/fs';

export class PluginFactory {
  static async create(name: string, item: PluginConfigItem, opts?: PluginCreateOptions): Promise<PluginType> {
    const pluginInstance = new Plugin(name, item, opts);
    await pluginInstance.init();
    return pluginInstance;
  }

  static async createFromConfig(config: Record<string, PluginConfigItem>, opts?: PluginCreateOptions): Promise<PluginType[]> {
    const pluginInstanceMap: PluginMap = new Map();
    for (const [name, item] of Object.entries(config)) {
      const pluginInstance = await PluginFactory.create(name, item, opts);
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

  static async formatPluginConfig(config: Record<string, PluginConfigItem>, manifestItem?: ManifestItem): Promise<Record<string, PluginConfigItem>> {
    const newConfig: Record<string, PluginConfigItem> = {};
    const loaderState = manifestItem?.loaderState as { baseDir: string };
    for (const pluginName of Object.keys(config)) {
      const pluginConfigItem: PluginConfigItem = config[pluginName];
      if (pluginConfigItem.package) {
        // convert package to path when load plugin config
        if (pluginConfigItem.path) {
          throw new Error(
            `Plugin ${pluginName} config can't have both package and path at ${manifestItem?.path ?? 'UNKNOWN_PATH'}`,
          );
        }
        const requirePaths = loaderState?.baseDir ? [loaderState.baseDir] : undefined;
        pluginConfigItem.path = getPackagePath(pluginConfigItem.package, requirePaths);
        delete pluginConfigItem.package;
      } else if (pluginConfigItem.path && await exists(path.resolve(pluginConfigItem.path, 'package.json'))) {
        // plugin path is a npm package, need resolve main file
        pluginConfigItem.path = await getInlinePackageEntryPath(pluginConfigItem.path);
      }
      newConfig[pluginName] = pluginConfigItem;
    }
    return newConfig;
  }
}
