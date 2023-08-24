import path from 'path';
import compatibleRequire from '../utils/compatible_require';
import { PluginType } from './types';
import { LoggerType } from '../logger';

export function sortPlugins(pluginInstanceMap: Map<string, PluginType>, logger: LoggerType) {
  const sortedPlugins: PluginType[] = [];
  const visited: Record<string, boolean> = {};

  while (sortedPlugins.length < pluginInstanceMap.size) {
    let added = false;

    for (const [pluginName, plugin] of pluginInstanceMap) {
      if (visited[pluginName]) {
        continue;
      }

      let depsSatisfied = true;
      for (const dep of plugin.metadata.dependencies ?? []) {
        const depPlugin = pluginInstanceMap.get(dep.name);
        if (!depPlugin || !depPlugin.enable) {
          if (dep.optional) {
            logger?.warn(`Plugin ${plugin.name} need have optional dependency: ${dep.name}.`);
          } else {
            throw new Error(`Plugin ${plugin.name} need have dependency: ${dep.name}.`);
          }
        } else if (!visited[dep.name]) { // Plugin exist and enabled, need check visited
          depsSatisfied = false;
        }
      }

      if (depsSatisfied) {
        sortedPlugins.push(plugin);
        visited[plugin.name] = true;
        added = true;
      }
    }

    if (!added) {
      const cyclePluginNames: string[] = [];
      const sortedPluginSet = new Set(sortedPlugins.map(p => p.name));
      for (const pluginName of pluginInstanceMap.keys()) {
        if (!sortedPluginSet.has(pluginName)) {
          cyclePluginNames.push(pluginName);
        }
      }
      throw new Error(`Circular dependency found in plugins: ${cyclePluginNames.join(', ')}`);
    }
  }

  return sortedPlugins;
}

// A util function of get package path for plugin
export function getPackagePath(packageName: string, paths: string[] = []): string {
  const opts = {
    paths: paths.concat(__dirname),
  };
  return path.dirname(require.resolve(packageName, opts));
}

export async function getInlinePackageEntryPath(packagePath: string): Promise<string> {
  const pkgJson = await compatibleRequire(`${packagePath}/package.json`);
  let entryFilePath = '';
  if (pkgJson.exports) {
    if (Array.isArray(pkgJson.exports)) {
      throw new Error(`inline package multi exports is not supported`);
    } else if (typeof pkgJson.exports === 'string') {
      entryFilePath = pkgJson.exports;
    } else if (pkgJson.exports?.['.']) {
      entryFilePath = pkgJson.exports['.'];
    }
  }
  if (!entryFilePath && pkgJson.main) {
    entryFilePath = pkgJson.main;
  }
  // will use package root path if no entry file found
  return entryFilePath ? path.resolve(packagePath, entryFilePath, '..') : packagePath;
}
