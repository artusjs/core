import path from 'path';
import * as fs from 'fs/promises';
import { ScanContext, ScanTaskItem, WalkOptions } from './types';
import { existsAsync, getPackageVersion, getPluginMeta, getPluginRefName, getPluginRefPath, isExclude, isPluginAsync } from './utils';
import { LoaderFactory, ManifestItem, ManifestV2PluginConfig, ManifestV2PluginConfigItem } from '../loader';
import { PluginConfigItem, PluginDependencyItem } from '../plugin';
import { mergeConfig } from '../loader/utils/merge';
import { Container } from '@artus/injection';
import ConfigurationHandler from '../configuration';

const walkDir = async (root: string, options: WalkOptions, itemList: ManifestItem[] = []) => {
  const { baseDir, configDir } = options;
  if (!(await existsAsync(root))) {
    // TODO: use artus logger instead
    console.warn(`[scan->walk] ${root} is not exists.`);
    return itemList;
  }

  const stat = await fs.stat(root);
  if (!stat.isDirectory()) {
    return itemList;
  }

  const items = await fs.readdir(root);
  for (const item of items) {
    const realPath = path.resolve(root, item);
    const extname = path.extname(realPath);
    if (isExclude(item, extname, options.exclude, options.extensions)) {
      continue;
    }
    const itemStat = await fs.stat(realPath);
    if (itemStat.isDirectory()) {
      // ignore plugin dir
      if (await isPluginAsync(realPath)) {
        continue;
      }
      await walkDir(realPath, options, itemList);
      continue;
    }

    if (itemStat.isFile()) {
      if (!extname) {
        // Exclude file without extname
        continue;
      }
      const filename = path.basename(realPath);
      const filenameWithoutExt = path.basename(realPath, extname);
      const loaderFindResult = await LoaderFactory.findLoader({
        filename,
        root,
        baseDir,
        configDir,
        policy: options.policy,
      });
      if (!loaderFindResult) {
        continue;
      }
      const { loaderName, loaderState } = loaderFindResult;
      const item: ManifestItem = {
        path: path.resolve(root, filenameWithoutExt),
        extname,
        filename,
        loader: loaderName,
      };
      if (loaderState) {
        item.loaderState = loaderState;
      }
      if (Array.isArray(itemList)) {
        itemList.push(item);
      }
    }
  }
  return itemList;
};

export const handlePluginConfig = async (configItemList: ManifestItem[], root: string, basePath: string, scanCtx: ScanContext): Promise<void> => {
  if (!configItemList.length) {
    return;
  }

  const refNameSet = new Set<string>();
  const container = new Container('_');
  container.set({
    type: ConfigurationHandler,
  });
  const loaderFactory = new LoaderFactory(container);
  await loaderFactory.loadItemList(configItemList);
  const pluginConfigEnvMap: Record<string, ManifestV2PluginConfig> = {};
  for (const [env, configObj] of loaderFactory.configurationHandler.configStore) {
    if (configObj?.plugin) {
      pluginConfigEnvMap[env] = {};
      for (const [pluginName, pluginConfigItem] of Object.entries(configObj.plugin as Record<string, PluginConfigItem>)) {
        const refName = getPluginRefName(pluginConfigItem, root);
        pluginConfigEnvMap[env][pluginName] = {
          enable: configObj.plugin.enable,
          refName,
        } as ManifestV2PluginConfigItem;
        if (refName && !refNameSet.has(refName) && !scanCtx.refMap[refName]) {
          // Generate and push scan task
          scanCtx.taskQueue.push({
            root,
            subPath: await getPluginRefPath(pluginConfigItem, root, basePath),
            refName,
          });
          refNameSet.add(refName);
        }
      }
    }
  }
  scanCtx.pluginConfigMap = mergeConfig(pluginConfigEnvMap, scanCtx.pluginConfigMap) as Record<string, ManifestV2PluginConfig>;
};


/**
 * Handler of single scan task(only a ref)
 */
export const runTask = async (taskItem: ScanTaskItem, scanCtx: ScanContext) => {
  const { root, subPath = '', refName } = taskItem;
  const basePath = path.resolve(root, subPath);
  const curPackageVersion = await getPackageVersion(basePath);
  if (scanCtx.refMap[refName]) {
    // Already scanned
    const refItem = scanCtx.refMap[refName];
    if (refItem.packageVersion && curPackageVersion && curPackageVersion !== refItem.packageVersion) {
      // Do NOT allow multi-version of plugin package
      throw new Error(`${refName} has multi version of ${curPackageVersion}, ${refItem.packageVersion}`);
    }
    return;
  }

  const walkOpts: WalkOptions = {
    baseDir: basePath,
    configDir: scanCtx.options.configDir,
    exclude: scanCtx.options.exclude,
    extensions: scanCtx.options.extensions,
    policy: scanCtx.options.policy,
  };
  let dependencies: PluginDependencyItem[];

  if (await isPluginAsync(basePath)) {
    const pluginMeta = await getPluginMeta(basePath);
    walkOpts.configDir = pluginMeta.configDir || walkOpts.configDir;
    walkOpts.exclude = walkOpts.exclude.concat(pluginMeta.exclude ?? []);
    dependencies = pluginMeta.dependencies;
  }

  const itemList = await walkDir(basePath, walkOpts);
  const configItemList = itemList.filter(item => item.loader === 'config');
  await handlePluginConfig(configItemList, root, basePath, scanCtx);

  scanCtx.refMap[refName] = {
    packageVersion: await getPackageVersion(basePath),
    dependencies,
    items: scanCtx.options.useRelativePath ? itemList.map(item => ({
      ...item,
      path: path.relative(root, item.path),
    })) : itemList,
  };
};

