import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { isMatch } from '../utils';
import compatibleRequire from '../utils/compatible_require';
import { PLUGIN_META_FILENAME } from '../constant';
import { PluginConfigItem } from '../plugin';
import { getInlinePackageEntryPath, getPackagePath } from '../plugin/common';

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

export const isExclude = (filename: string, extname: string, exclude: string[], extensions: string[]): boolean => {
  let result = false;
  if (!result && exclude) {
    result = isMatch(filename, exclude);
  }

  if (!result && extname) {
    result = !extensions.includes(extname);
  }
  return result;
};

export const isPluginAsync = (basePath: string): Promise<boolean> => {
  return existsAsync(path.resolve(basePath, PLUGIN_META_FILENAME));
};

export const getPluginRefName = (pluginConfigItem: PluginConfigItem, root: string): string | undefined => {
  if (pluginConfigItem.package) {
    return pluginConfigItem.package;
  }
  if (pluginConfigItem.path) {
    return path.isAbsolute(pluginConfigItem.path) ? path.relative(root, pluginConfigItem.path) : pluginConfigItem.path;
  }
  return undefined;
};

export const getPluginRefPath = async (pluginConfigItem: PluginConfigItem, root: string, baseDir: string): Promise<string | undefined> => {
  if (pluginConfigItem.package) {
    return getPackagePath(pluginConfigItem.package, [baseDir]);
  } else if (pluginConfigItem.path && await existsAsync(path.resolve(pluginConfigItem.path, 'package.json'))) {
    const pluginEntryPath = await getInlinePackageEntryPath(pluginConfigItem.path);
    return path.relative(root, pluginEntryPath);
  } else if (pluginConfigItem.path) {
    return path.isAbsolute(pluginConfigItem.path) ? path.relative(root, pluginConfigItem.path) : pluginConfigItem.path;
  }
  return undefined;
};

