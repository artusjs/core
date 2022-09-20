import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs/promises';
import deepmerge from 'deepmerge';
import { Container } from '@artus/injection';
import {
  ArtusInjectEnum,
  ARTUS_DEFAULT_CONFIG_ENV,
  DEFAULT_CONFIG_DIR,
  DEFAULT_EXCLUDES,
  DEFAULT_LOADER_LIST_WITH_ORDER,
  LOADER_NAME_META,
  ScanPolicy,
} from '../constant';
import { LoaderFactory, Manifest, ManifestItem } from '../loader';
import { ScannerOptions, WalkOptions } from './types';
import ConfigurationHandler, { ConfigObject } from '../configuration';
import { FrameworkConfig, FrameworkHandler } from '../framework';
import { PluginType, PluginFactory } from '../plugin';
import { ScanUtils } from './utils';
import { PluginConfigItem, PluginMetadata } from '../plugin/types';
import { getConfigMetaFromFilename } from '../loader/utils/config_file_meta';
import { Application } from '../types';
import { ArtusApplication } from '../application';

export class Scanner {
  private moduleExtensions = ['.js', '.json', '.node'];
  private options: ScannerOptions;
  private itemMap: Map<string, ManifestItem[]> = new Map();
  private tmpConfigStore: Map<string, ConfigObject[]> = new Map();
  private configHandle: ConfigurationHandler = new ConfigurationHandler();
  private app: Application;

  constructor(options: Partial<ScannerOptions> = {}) {
    this.options = {
      appName: 'app',
      needWriteFile: true,
      useRelativePath: true,
      configDir: DEFAULT_CONFIG_DIR,
      loaderListGenerator: (defaultLoaderList: string[]) => defaultLoaderList,
      policy: ScanPolicy.All,
      ...options,
      exclude: DEFAULT_EXCLUDES.concat(options.exclude ?? []),
      extensions: [...new Set(this.moduleExtensions.concat(options.extensions ?? []))],
    };
    this.app = options.app ?? new ArtusApplication();
  }

  private async initItemMap(): Promise<void> {
    this.itemMap = new Map(
      this.options.loaderListGenerator(DEFAULT_LOADER_LIST_WITH_ORDER).map(loaderNameOrClazz => {
        if (typeof loaderNameOrClazz === 'string') {
          return [loaderNameOrClazz, []];
        }
        const loaderClazz = loaderNameOrClazz;
        const loaderName = Reflect.getMetadata(LOADER_NAME_META, loaderClazz);
        if (!loaderName) {
          throw new Error(`Loader ${loaderClazz.name} must have a @DefineLoader() decorator.`);
        }
        return [loaderName, []];
      }),
    );
  }

  private async scanEnvList(root: string): Promise<string[]> {
    const { configDir, envs } = this.options;
    if (Array.isArray(envs) && envs.length) {
      return envs;
    }
    const configFileList = await fs.readdir(path.resolve(root, configDir));
    const envSet: Set<string> = new Set([ARTUS_DEFAULT_CONFIG_ENV.DEFAULT]);
    for (const configFilename of configFileList) {
      if (configFilename.endsWith('.d.ts')) {
        continue;
      }
      const env = ConfigurationHandler.getEnvFromFilename(configFilename);
      envSet.add(env);
    }
    return [...envSet];
  }

  async scan(root: string): Promise<Record<string, Manifest>> {
    const result = {};
    const envList = await this.scanEnvList(root);

    for (const env of envList) {
      result[env] = await this.scanManifestByEnv(root, env);
    }

    if (this.options.needWriteFile) {
      await this.writeFile(`manifest.json`, JSON.stringify(result, null, 2));
    }

    return result;
  }

  private async scanManifestByEnv(root: string, env: string): Promise<Manifest> {
    // 0. init clean itemMap
    await this.initItemMap();

    // 1. Pre-Scan all config files
    const config = await this.getAllConfig(root, env);

    // 2. scan all file in framework
    const frameworkConfig = config.framework ?? this.options.framework;
    const frameworkDirs = await this.getFrameworkDirs(frameworkConfig, root, env);
    for (const frameworkDir of frameworkDirs) {
      await this.walk(frameworkDir, this.formatWalkOptions('framework', frameworkDir));
    }


    // 3. scan all file in plugin
    if (this.tmpConfigStore.has(env)) {
      const configList = this.tmpConfigStore.get(env) ?? [];
      configList.forEach(config => this.configHandle.setConfig(env, config));
    }
    const { plugin } = this.configHandle.getMergedConfig(env);
    const pluginConfig = deepmerge.all([plugin || {}, this.options.plugin || {}]) as Record<string, PluginConfigItem>;
    const pluginSortedList = await PluginFactory.createFromConfig(pluginConfig, {
      logger: this.app.logger,
    });
    for (const plugin of pluginSortedList) {
      if (!plugin.enable) continue;
      this.setPluginMeta(plugin);
      await this.walk(
        plugin.importPath,
        this.formatWalkOptions('plugin', plugin.importPath, plugin.name, plugin.metadata),
      );
    }

    // 4. scan all file in app
    await this.walk(root, this.formatWalkOptions('app', root, ''));

    const relative = this.options.useRelativePath;
    if (relative) {
      for (const [pluginName, pluginConfigItem] of Object.entries(pluginConfig)) {
        if (pluginConfigItem.path) {
          pluginConfig[pluginName].path = path.relative(root, pluginConfigItem.path);
        }
      }
    }
    const result: Manifest = {
      pluginConfig,
      items: this.getItemsFromMap(relative, root, env),
      relative,
    };
    return result;
  }

  private async walk(root: string, options: WalkOptions) {
    await ScanUtils.walk(root, options);
  }

  private setPluginMeta(plugin: PluginType) {
    const metaList = this.itemMap.get('plugin-meta') ?? [];
    metaList.push({
      path: plugin.metaFilePath,
      extname: path.extname(plugin.metaFilePath),
      filename: path.basename(plugin.metaFilePath),
      loader: 'plugin-meta',
      source: 'plugin',
      unitName: plugin.name,
    });
  }

  private async getAllConfig(baseDir: string, env: string) {
    const configDir = this.getConfigDir(baseDir, this.options.configDir);
    if (!configDir) {
      return {};
    }
    const root = path.resolve(baseDir, configDir);
    const configFileList = await fs.readdir(root);
    const container = new Container(ArtusInjectEnum.DefaultContainerName);
    container.set({ type: ConfigurationHandler });
    container.set({
      id: ArtusInjectEnum.Application,
      value: this.app,
    });
    const loaderFactory = LoaderFactory.create(container);
    const configItemList: (ManifestItem | null)[] = await Promise.all(configFileList.map(async filename => {
      const extname = path.extname(filename);
      if (ScanUtils.isExclude(filename, extname, this.options.exclude, this.options.extensions)) {
        return null;
      }
      let { loader } = await loaderFactory.findLoaderName({
        filename,
        baseDir,
        root,
        configDir,
        policy: this.options.policy,
      });
      if (loader === 'framework-config') {
        // SEEME: framework-config is a special loader, cannot be used when scan, need refactor later
        loader = 'config';
      }
      return {
        path: path.resolve(root, filename),
        extname,
        filename,
        loader,
        source: 'config',
        loaderState: {
          baseDir,
        },
      };
    }));
    await loaderFactory.loadItemList(configItemList.filter(v => v) as ManifestItem[]);
    const configurationHandler = container.get(ConfigurationHandler);
    const config = configurationHandler.getMergedConfig(env);
    let configList = [config];
    if (this.tmpConfigStore.has(env)) {
      // equal unshift config to configList
      configList = configList.concat(this.tmpConfigStore.get(env) ?? []);
    }
    this.tmpConfigStore.set(env, configList);
    return config;
  }

  private getConfigDir(root: string, dir: string): string {
    if (ScanUtils.exist(root, [dir])) {
      return dir;
    }

    if (ScanUtils.exist(root, [DEFAULT_CONFIG_DIR])) {
      return DEFAULT_CONFIG_DIR;
    }

    return '';
  }

  private async getFrameworkDirs(
    config: FrameworkConfig,
    root: string,
    env: string,
    dirs: string[] = [],
  ): Promise<string[]> {
    if (!config || (!config.path && !config.package)) {
      return dirs;
    }

    const frameworkBaseDir = await FrameworkHandler.handle(root, config);
    dirs.unshift(frameworkBaseDir);

    // scan recurse
    const configInFramework = await this.getAllConfig(frameworkBaseDir, env);
    const frameworkDirs = await this.getFrameworkDirs(configInFramework.framework, frameworkBaseDir, env, dirs);
    return frameworkDirs;
  }

  private formatWalkOptions(source: string, baseDir: string, unitName?: string, metaInfo?: Partial<PluginMetadata>): WalkOptions {
    const opts: WalkOptions = {
      itemMap: this.itemMap,
      source,
      baseDir,
      unitName: unitName ?? baseDir,
      extensions: this.options.extensions,
      exclude: this.options.exclude,
      configDir: this.options.configDir,
      policy: this.options.policy,
    };

    if (source === 'plugin') {
      // TODO: Only support plugin meta now, need cover framework meta later
      opts.exclude = DEFAULT_EXCLUDES.concat(metaInfo.exclude ?? []);
      opts.configDir = metaInfo.configDir ?? this.options.configDir;
    }

    return opts;
  }

  private getItemsFromMap(relative: boolean, appRoot: string, env: string): ManifestItem[] {
    let items: ManifestItem[] = [];
    for (const [, unitItems] of this.itemMap) {
      items = items.concat(unitItems);
    }
    relative && items.forEach(item => (item.path = path.relative(appRoot, item.path)));
    return items.filter(item => {
      // remove PluginConfig to avoid re-merge on application running
      if (item.loader === 'plugin-config') {
        return false;
      }

      // remove other env config
      if (item.loader === 'config' || item.loader === 'framework-config') {
        const { env: filenameEnv } = getConfigMetaFromFilename(item.filename);
        if (env !== filenameEnv && filenameEnv !== ARTUS_DEFAULT_CONFIG_ENV.DEFAULT) {
          return false;
        }
      }

      return true;
    });
  }

  private async writeFile(filename = 'manifest.json', data: string) {
    await fs.writeFile(filename, data);
  }
}
