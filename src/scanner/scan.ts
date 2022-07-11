import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Container } from '@artus/injection';
import {
  ArtusInjectEnum,
  ARTUS_DEFAULT_CONFIG_ENV,
  DEFAULT_CONFIG_DIR,
  DEFAULT_EXCLUDES,
  DEFAULT_EXTENSIONS,
  DEFAULT_LOADER_LIST_WITH_ORDER,
  LOADER_NAME_META,
} from '../constant';
import { LoaderFactory, Manifest, ManifestItem } from '../loader';
import { Metadata } from '../types';
import { ScannerOptions, WalkOptions } from './types';
import ConfigurationHandler, { ConfigObject } from '../configuration';
import { FrameworkConfig, FrameworkHandler } from '../framework';
import { BasePlugin, PluginFactory } from '../plugin';
import { ScanUtils } from './utils';

export class Scanner {
  private options: ScannerOptions;
  private itemMap: Map<string, ManifestItem[]> = new Map();
  private tmpConfigStore: Map<string, ConfigObject[]> = new Map();
  private configHandle: ConfigurationHandler = new ConfigurationHandler();

  constructor(options: Partial<ScannerOptions> = {}) {
    this.options = {
      appName: 'app',
      needWriteFile: true,
      useRelativePath: true,
      configDir: DEFAULT_CONFIG_DIR,
      loaderListGenerator: (defaultLoaderList: string[]) => defaultLoaderList,
      ...options,
      excluded: [...new Set(DEFAULT_EXCLUDES.concat(options.excluded ?? []))],
      extensions: [...new Set(DEFAULT_EXTENSIONS.concat(options.extensions ?? []))],
    };
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
      })
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
  
    const config = await this.getAllConfig(root, env);

    // 1. scan all file in framework
    const frameworkDirs = await this.getFrameworkDirs(config.framework, root, env);
    for (const frameworkDir of frameworkDirs) {
      const frameworkMetadata = await FrameworkHandler.checkAndLoadMetadata(frameworkDir);
      const frameworkOptions = this.formatWalkOptions('framework', frameworkDir, frameworkDir, frameworkMetadata);
      await this.walk(frameworkDir, frameworkOptions);
    }


    // 2. scan all file in plugin
    if (this.tmpConfigStore.has(env)) {
      const configList = this.tmpConfigStore.get(env) ?? [];
      configList.forEach(config => this.configHandle.setConfig(env, config));
    }
    const { plugin } = this.configHandle.getMergedConfig(env);
    const pluginSortedList = await PluginFactory.createFromConfig(plugin || {});
    for (const plugin of pluginSortedList) {
      if (!plugin.enable) continue;
      this.setPluginMeta(plugin);
      const pluginOpts = this.formatWalkOptions('plugin', plugin.importPath, plugin.name, plugin.metadata as Metadata);
      await this.walk(plugin.importPath, pluginOpts);
    }

    // 3. scan all file in app
    await this.walk(root, this.formatWalkOptions('app', root, ''));

    const result: Manifest = {
      items: this.getItemsFromMap(this.options.useRelativePath, root),
      relative: this.options.useRelativePath,
    };
    return result;
  }

  private async walk(root: string, options: WalkOptions) {
    await ScanUtils.walk(root, options);
  }

  private setPluginMeta(plugin: BasePlugin) {
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
    const loaderFactory = LoaderFactory.create(container);
    const configItemList: (ManifestItem | null)[] = await Promise.all(configFileList.map(async filename => {
      const extname = path.extname(filename);
      if (ScanUtils.isExclude(filename, extname, this.options.excluded, this.options.extensions)) {
        return null;
      }
      let loader = await loaderFactory.findLoaderName({
        filename,
        baseDir,
        root,
        configDir
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
    dirs: string[] = []
  ): Promise<string[]> {
    if (!config || (!config.path && !config.package)) {
      return dirs;
    }

    const frameworkBaseDir = await FrameworkHandler.handle(root, config);
    dirs.unshift(frameworkBaseDir);

    // scan recurse
    const configInFramework = await this.getAllConfig(frameworkBaseDir, env);
    return await this.getFrameworkDirs(configInFramework.framework, frameworkBaseDir, env, dirs);
  }

  private formatWalkOptions(source: string, baseDir: string, unitName?: string, metadata?: Metadata): WalkOptions {
    const commonOptions = {
      extensions: this.options.extensions,
      excluded: this.options.excluded,
      itemMap: this.itemMap,
    };

    unitName ??= baseDir;
    const configDir = this.options.configDir;

    let result: WalkOptions = Object.assign({}, commonOptions, {
      source,
      baseDir,
      unitName,
      configDir,
    });
    // metadata takes priority
    if (metadata) {
      result = this.amendOptions(result, metadata);
    }
    return result;
  }

  private amendOptions(walkOptions: WalkOptions, metadata): WalkOptions {
    // plugin/framework excluded take priority over user app's
    if (metadata?.excluded) {
      walkOptions.excluded = DEFAULT_EXCLUDES.concat(metadata.excluded);
    } else {
      walkOptions.excluded = DEFAULT_EXCLUDES;
    }

    // plugin/framework extensions take priority over user app's
    // if (metadata?.extensions) {
    //   walkOptions.extensions = DEFAULT_EXTENSIONS.concat(metadata.extensions);
    // } else {
    //   walkOptions.extensions = DEFAULT_EXTENSIONS;
    // }

    // plugin/framework configDir take priority over user app's
    if (metadata?.configDir) {
      walkOptions.configDir = metadata.configDir;
    } else {
      walkOptions.configDir = DEFAULT_CONFIG_DIR;
    }
    return walkOptions;
  }

  private getItemsFromMap(relative: boolean, appRoot: string): ManifestItem[] {
    let items: ManifestItem[] = [];
    for (const [, unitItems] of this.itemMap) {
      items = items.concat(unitItems);
    }
    relative && items.forEach(item => (item.path = path.relative(appRoot, item.path)));
    return items.filter(item => (
      // remove PluginConfig to avoid re-merge on application running
      item.loader !== 'plugin-config'
    ));
  }

  private async writeFile(filename: string = 'manifest.json', data: string) {
    await fs.writeFile(filename, data);
  }
}
