import path from 'path';
import * as fs from 'fs/promises';
import { ScannerOptions, ScanTaskItem, WalkOptions } from './types';
import { existsAsync, getPackageVersion, isExclude, isPluginAsync, loadConfigItemList, resolvePluginConfigItemRef } from './utils';
import { findLoader, Manifest, ManifestItem, PluginConfigEnvMap, RefMap, RefMapItem } from '../loader';
import { PluginConfig, PluginMetadata } from '../plugin';
import { mergeConfig } from '../loader/utils/merge';
import { loadMetaFile } from '../utils/load_meta_file';
import { ARTUS_DEFAULT_CONFIG_ENV, DEFAULT_APP_REF, PLUGIN_META_FILENAME } from '../constant';
import { Application } from '../types';
import { ArtusApplication } from '../application';

export class ScanTaskRunner {
  private waitingTaskMap: Map<string, ScanTaskItem[]> = new Map(); // Key is pluginName, waiting to detect enabled
  private enabledPluginSet: Set<string> = new Set(); // Key is pluginName
  private pluginConfigMap: PluginConfigEnvMap = {};
  private refMap: RefMap = {};
  private taskQueue: ScanTaskItem[] = [];
  private app: Application;

  constructor(
    private root: string,
    private options: ScannerOptions,
  ) {
    this.app = options.app ?? new ArtusApplication();
  }

  /*
  * Handler for walk directories and files recursively
  */
  private async walk(curPath: string, options: WalkOptions) {
    const { baseDir, configDir } = options;
    if (!(await existsAsync(curPath))) {
      this.app.logger.warn(`[scan->walk] ${curPath} is not exists.`);
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
        return this.walk(realPath, options);
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
  }

  /*
   * Handler for pluginConfig object
   * Will push new task for plugin, and merge config by env
   */
  public async handlePluginConfig(
    pluginConfig: PluginConfig,
    basePath: string,
    env: string = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT,
  ): Promise<void> {
    const tPluginConfig: PluginConfig = {};
    for (const [pluginName, pluginConfigItem] of Object.entries(pluginConfig)) {
      // Set temp pluginConfig in manifest
      tPluginConfig[pluginName] = {};
      if (pluginConfigItem.enable !== undefined) {
        tPluginConfig[pluginName].enable = pluginConfigItem.enable;
      }
      if (pluginConfigItem.enable) {
        this.enabledPluginSet.add(pluginName);
      }

      // Resolve ref and set
      const isPluginEnabled = this.enabledPluginSet.has(pluginName);
      const ref = await resolvePluginConfigItemRef(pluginConfigItem, basePath, this.root);
      if (!ref?.name) {
        continue;
      }
      tPluginConfig[pluginName].refName = ref.name;
      // Generate and push scan task
      const curRefTask: ScanTaskItem = {
        curPath: ref.path,
        refName: ref.name,
        isPackage: ref.isPackage,
      };
      const waitingTaskList = this.waitingTaskMap.get(pluginName) ?? [];
      // Use unshift to make the items later in the list have higher priority
      if (isPluginEnabled) {
        // Ref need scan immediately and add all waiting task to queue
        this.taskQueue.unshift(curRefTask);
        for (const waitingTask of waitingTaskList) {
          this.taskQueue.unshift(waitingTask);
        }
        this.waitingTaskMap.delete(pluginName);
      } else {
        // Need waiting to detect enabled, push refTask to waitingList
        waitingTaskList.unshift(curRefTask);
        this.waitingTaskMap.set(pluginName, waitingTaskList);
      }
    }
    // Reverse Merge, The prior of top-level(exists) is higher
    const existsPluginConfig = this.pluginConfigMap[env] ?? {};
    this.pluginConfigMap[env] = mergeConfig(tPluginConfig, existsPluginConfig) as PluginConfig;
  }


  /**
  * Handler of single scan task(only a ref)
  */
  public async run(taskItem: ScanTaskItem): Promise<void> {
    const { curPath = '', refName, isPackage } = taskItem;
    let basePath = curPath;
    if (!path.isAbsolute(basePath)) {
      // basePath must be absolute path
      basePath = path.resolve(this.root, curPath);
    }

    // pre-scan check for multi-version package
    const relativedPath = path.relative(this.root, basePath);
    const packageVersion = await getPackageVersion(
      (refName === DEFAULT_APP_REF || !isPackage)
        ? basePath
        : refName,
    );

    if (this.refMap[refName]) {
      // Already scanned
      if (refName === DEFAULT_APP_REF) {
        // No need to check app level
        return;
      }
      const refItem = this.refMap[refName];
      if (refItem.packageVersion && packageVersion && packageVersion !== refItem.packageVersion) {
        // Do NOT allow multi-version of plugin package by different version number
        throw new Error(`${refName} has multi version of ${packageVersion}, ${refItem.packageVersion}`);
      }
      if (refItem.relativedPath && relativedPath && relativedPath !== refItem.relativedPath) {
        // Do NOT allow multi-version of plugin package by different path
        throw new Error(`${refName} has multi path with same version in ${relativedPath} and ${refItem.relativedPath}`);
      }
      return;
    }

    const walkOpts: WalkOptions = {
      baseDir: basePath,
      configDir: this.options.configDir,
      exclude: this.options.exclude,
      extensions: this.options.extensions,
      policy: this.options.policy,
      source: refName === DEFAULT_APP_REF ? 'app' : 'plugin',
      unitName: refName,
    };
    const refItem: RefMapItem = {
      relativedPath,
      packageVersion,
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

    refItem.items = await this.walk(basePath, walkOpts);
    const configItemList = refItem.items.filter(item => item.loader === 'config');
    const pluginConfigEnvMap = await loadConfigItemList<{
      plugin: PluginConfig;
    }>(configItemList, this.app);
    for (const [env, configObj] of Object.entries(pluginConfigEnvMap)) {
      const pluginConfig = configObj?.plugin;
      if (!pluginConfig) {
        continue;
      }
      await this.handlePluginConfig(pluginConfig, basePath, env);
    }

    if (this.options.useRelativePath) {
      refItem.items = refItem.items.map(item => ({
        ...item,
        path: path.relative(this.root, item.path),
      }));
    }

    this.refMap[refName] = refItem;
  }

  public async runAll(): Promise<void> {
    // Add Task of options.plugin
    if (this.options.plugin) {
      await this.handlePluginConfig(this.options.plugin, this.root);
    }

    // Add Root Task(make it as top/start)
    this.taskQueue.unshift({
      curPath: '.',
      refName: DEFAULT_APP_REF,
      isPackage: false,
    });

    // Run task queue
    while (this.taskQueue.length > 0) {
      const taskItem = this.taskQueue.shift();
      await this.run(taskItem);
    }
  }

  public dump(): Manifest {
    return {
      version: '2',
      pluginConfig: this.pluginConfigMap,
      refMap: this.refMap,
    };
  }
}

