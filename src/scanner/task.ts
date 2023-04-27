import path from 'path';
import * as fs from 'fs/promises';
import { ScanContext, ScanTaskItem, WalkOptions } from './types';
import { existsAsync, getPackageVersion, isExclude, isPluginAsync, loadConfigItemList, resolvePluginConfigItemRef } from './utils';
import { findLoader, ManifestItem, RefMapItem } from '../loader';
import { PluginConfig, PluginMetadata } from '../plugin';
import { mergeConfig } from '../loader/utils/merge';
import { loadMetaFile } from '../utils/load_meta_file';
import { ARTUS_DEFAULT_CONFIG_ENV, DEFAULT_APP_REF, PLUGIN_META_FILENAME } from '../constant';

const walkDir = async (curPath: string, options: WalkOptions) => {
  const { baseDir, configDir } = options;
  if (!(await existsAsync(curPath))) {
    // TODO: use artus logger instead
    console.warn(`[scan->walk] ${curPath} is not exists.`);
    return [];
  }

  const stat = await fs.stat(curPath);
  if (!stat.isDirectory()) {
    return [];
  }

  const items = await fs.readdir(curPath);
  const itemWalkResult = await Promise.all(items.map(async (item): Promise<ManifestItem[]> => {
    const realPath = path.resolve(curPath, item);
    const extname = path.extname(realPath);
    const relativePath = path.relative(baseDir, realPath);
    if (isExclude(relativePath, options.exclude, options.extensions)) {
      return [];
    }
    const itemStat = await fs.stat(realPath);
    if (itemStat.isDirectory()) {
      // ignore plugin dir
      if (await isPluginAsync(realPath)) {
        return [];
      }
      return walkDir(realPath, options);
    } else if (itemStat.isFile()) {
      if (!extname) {
        // Exclude file without extname
        return [];
      }
      const filename = path.basename(realPath);
      const filenameWithoutExt = path.basename(realPath, extname);
      const loaderFindResult = await findLoader({
        filename,
        root: curPath,
        baseDir,
        configDir,
        policy: options.policy,
      });
      if (!loaderFindResult) {
        return [];
      }
      const { loaderName, loaderState } = loaderFindResult;
      const item: ManifestItem = {
        path: path.resolve(curPath, filenameWithoutExt),
        extname,
        filename,
        loader: loaderName,
        source: options.source,
        unitName: options.unitName,
      };
      if (loaderState) {
        item.loaderState = loaderState;
      }
      return [item];
    } else {
      return [];
    }
  }));
  return itemWalkResult.reduce((itemList, result) => itemList.concat(result), []);
};

export const handlePluginConfig = async (
  pluginConfig: PluginConfig,
  basePath: string,
  scanCtx: ScanContext,
  env: string = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT,
): Promise<void> => {
  const tPluginConfig: PluginConfig = {};
  for (const [pluginName, pluginConfigItem] of Object.entries(pluginConfig)) {
    // Set temp pluginConfig in manifest
    tPluginConfig[pluginName] = {};
    if (pluginConfigItem.enable !== undefined) {
      tPluginConfig[pluginName].enable = pluginConfigItem.enable;
    }
    if (pluginConfigItem.enable) {
      scanCtx.enabledPluginSet.add(pluginName);
    }
    
    // Resolve ref and set
    const isPluginEnabled = scanCtx.enabledPluginSet.has(pluginName);
    const ref = await resolvePluginConfigItemRef(pluginConfigItem, basePath, scanCtx);
    if (!ref?.name) {
      continue;
    }
    tPluginConfig[pluginName].refName = ref.name;
    // Generate and push scan task
    const curRefTask: ScanTaskItem = {
      curPath: ref.path,
      refName: ref.name,
      checkPackageVersion: ref.isPackage,
    };
    const waitingTaskList = scanCtx.waitingTaskMap.get(pluginName) ?? [];
    if (isPluginEnabled) {
      // Ref need scan immediately and add all waiting task to queue
      scanCtx.taskQueue.push(curRefTask);
      for (const waitingTask of waitingTaskList) {
        scanCtx.taskQueue.push(waitingTask);
      }
      scanCtx.waitingTaskMap.delete(pluginName);
    } else {
      // Need waiting to detect enabled, push refTask to waitingList
      waitingTaskList.push(curRefTask);
      scanCtx.waitingTaskMap.set(pluginName, waitingTaskList);
    }
  }
  // Reverse Merge, The prior of top-level(exists) is higher
  const existsPluginConfig = scanCtx.pluginConfigMap[env] ?? {};
  scanCtx.pluginConfigMap[env] = mergeConfig(tPluginConfig, existsPluginConfig) as PluginConfig;
};


/**
* Handler of single scan task(only a ref)
*/
export const runTask = async (taskItem: ScanTaskItem, scanCtx: ScanContext) => {
  const { curPath = '', refName, checkPackageVersion } = taskItem;
  const { root, refMap, options } = scanCtx;
  let basePath = curPath;
  if (!path.isAbsolute(basePath)) {
    basePath = path.resolve(root, curPath);
  }
  if (refMap[refName]) {
    // Already scanned
    const refItem = refMap[refName];
    if (checkPackageVersion && refItem.packageVersion) {
      const curPackageVersion = await getPackageVersion(refName === DEFAULT_APP_REF ? basePath : refName);
      if (curPackageVersion && curPackageVersion !== refItem.packageVersion) {
        // Do NOT allow multi-version of plugin package
        throw new Error(`${refName} has multi version of ${curPackageVersion}, ${refItem.packageVersion}`);
      }
    }
    return;
  }

  const walkOpts: WalkOptions = {
    baseDir: basePath,
    configDir: scanCtx.options.configDir,
    exclude: scanCtx.options.exclude,
    extensions: scanCtx.options.extensions,
    policy: scanCtx.options.policy,
    source: refName === DEFAULT_APP_REF ? 'app' : 'plugin',
    unitName: refName,
  };
  const refItem: RefMapItem = {
    packageVersion: await getPackageVersion(basePath),
    items: [],
  };

  if (await isPluginAsync(basePath)) {
    const metaFilePath = path.resolve(basePath, PLUGIN_META_FILENAME);
    const pluginMeta: PluginMetadata = await loadMetaFile(metaFilePath);
    walkOpts.configDir = pluginMeta.configDir || walkOpts.configDir;
    walkOpts.exclude = walkOpts.exclude.concat(pluginMeta.exclude ?? []);
    walkOpts.unitName = pluginMeta.name;
    refItem.pluginMetadata = pluginMeta;
  }

  refItem.items = await walkDir(basePath, walkOpts);
  const configItemList = refItem.items.filter(item => item.loader === 'config');
  const pluginConfigEnvMap = await loadConfigItemList<{
    plugin: PluginConfig;
  }>(configItemList, scanCtx);
  for (const [env, configObj] of Object.entries(pluginConfigEnvMap)) {
    const pluginConfig = configObj?.plugin;
    if (!pluginConfig) {
      continue;
    }
    await handlePluginConfig(pluginConfig, basePath, scanCtx, env);
  }

  if (options.useRelativePath) {
    refItem.items = refItem.items.map(item => ({
      ...item,
      path: path.relative(root, item.path),
    }));
  }

  refMap[refName] = refItem;
};

