import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { Container } from '@artus/injection';
import { isMatch } from '../utils';
import compatibleRequire from '../utils/compatible_require';
import { ArtusInjectEnum, PLUGIN_META_FILENAME } from '../constant';
import { PluginConfigItem } from '../plugin';
import { getInlinePackageEntryPath, getPackagePath } from '../plugin/common';
import { ScanContext } from './types';
import { LoaderFactory, ManifestItem } from '../loader';
import ConfigurationHandler from '../configuration';

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

export const loadConfigItemList = async <T = Record<string, any>>(configItemList: ManifestItem[], scanCtx: ScanContext): Promise<Record<string, T>> => {
  if (!configItemList.length) {
    return {};
  }

  const container = new Container('_');
  container.set({
    id: Container,
    value: container,
  });
  container.set({
    type: ConfigurationHandler,
  });
  container.set({
    id: ArtusInjectEnum.Application,
    value: scanCtx.app,
  });
  const loaderFactory = new LoaderFactory(container);
  await loaderFactory.loadItemList(configItemList);
  return Object.fromEntries(loaderFactory.configurationHandler.configStore.entries()) as Record<string, T>;
};

export const resolvePluginConfigItemRef = async (
  pluginConfigItem: PluginConfigItem,
  baseDir: string,
  scanCtx: ScanContext,
): Promise<{
  name: string;
  path: string;
  isPackage: boolean;
} | null> => {
  if (pluginConfigItem.package) {
    const refPath = getPackagePath(pluginConfigItem.package, [baseDir]);
    return {
      name: pluginConfigItem.package,
      path: refPath,
      isPackage: true,
    };
  } else if (pluginConfigItem.path) {
    const refName = path.isAbsolute(pluginConfigItem.path) ? path.relative(scanCtx.root, pluginConfigItem.path) : pluginConfigItem.path;
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

