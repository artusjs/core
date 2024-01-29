import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { isMatch } from '../utils';
import compatibleRequire from '../utils/compatible_require';
import { PLUGIN_META_FILENAME } from '../constant';
import { PluginConfigItem } from '../plugin';
import { getInlinePackageEntryPath, getPackagePath } from '../plugin/common';
import { Application } from '../types';
import { ManifestItem } from '../loader';
import { ConfigObject } from '../configuration';

export const getPackageVersion = async (basePath: string): Promise<string | undefined> => {
  try {
    const packageJsonPath = path.resolve(basePath, 'package.json');
    const packageJson = await compatibleRequire(packageJsonPath);
    return packageJson?.version;
  } catch (error) {
    return undefined;
  }
};

export const existsAsync = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

export const isExclude = (targetPath: string, exclude: string[], extensions: string[]): boolean => {
  let result = false;
  if (!result && exclude) {
    result = isMatch(targetPath, exclude, true);
  }

  const extname = path.extname(targetPath);
  if (!result && extname) {
    result = !extensions.includes(extname);
  }
  return result;
};

export const isPluginAsync = (basePath: string): Promise<boolean> => {
  return existsAsync(path.resolve(basePath, PLUGIN_META_FILENAME));
};

export const loadConfigItemList = async <T = ConfigObject>(configItemList: ManifestItem[], app: Application): Promise<Record<string, T>> => {
  if (!configItemList.length) {
    return {};
  }

  // Use temp Map to store config
  const configEnvMap: Record<string, T> = {};
  const stashedConfigStore = app.configurationHandler.configStore;
  app.configurationHandler.configStore = configEnvMap;

  // Load all config items without hook
  const enabledLifecycleManager = app.lifecycleManager.enable;
  app.lifecycleManager.enable = false;
  await app.loaderFactory.loadItemList(configItemList);
  app.lifecycleManager.enable = enabledLifecycleManager;

  // Restore config store
  app.configurationHandler.configStore = stashedConfigStore;

  return configEnvMap;
};

export const resolvePluginConfigItemRef = async (
  pluginConfigItem: PluginConfigItem,
  baseDir: string,
  root: string,
): Promise<{
  name: string;
  path: string;
  isPackage: boolean;
} | null> => {
  if (pluginConfigItem.refName) {
    // For Unit-test
    return {
      name: pluginConfigItem.refName,
      path: pluginConfigItem.path ?? pluginConfigItem.refName,
      isPackage: !!pluginConfigItem.package,
    };
  }
  if (pluginConfigItem.package) {
    const refPath = getPackagePath(pluginConfigItem.package, [baseDir]);
    return {
      name: pluginConfigItem.package,
      path: refPath,
      isPackage: true,
    };
  } else if (pluginConfigItem.path) {
    const refName = path.isAbsolute(pluginConfigItem.path) ? path.relative(root, pluginConfigItem.path) : pluginConfigItem.path;
    let refPath = refName;

    const packageJsonPath = path.resolve(pluginConfigItem.path, 'package.json');
    if (await existsAsync(packageJsonPath)) {
      refPath = await getInlinePackageEntryPath(pluginConfigItem.path);
    }
    return {
      name: refName,
      path: refPath,
      isPackage: false,
    };
  }
  return null;
};

