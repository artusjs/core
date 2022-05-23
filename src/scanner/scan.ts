import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { Container } from '@artus/injection';
import {
  ArtusInjectEnum,
  ARTUS_DEFAULT_CONFIG_ENV,
  DEFAULT_CONFIG_DIR,
  DEFAULT_EXCLUDES,
  DEFAULT_LOADER_LIST_WITH_ORDER,
  LOADER_NAME_META,
} from "../constraints";
import { Manifest, ManifestItem } from "../loader";
import { ScannerOptions, WalkOptions } from "./types";
import ConfigurationHandler, { ConfigObject } from '../configuration';
import { ConfigLoader } from '../loader/impl';
import { FrameworkConfig, FrameworkHandler } from '../framework';
import { BasePlugin, PluginFactory } from '../plugin';
import Walk from './walk';

export class Scanner {
  private moduleExtensions = ['.js', '.json', '.node'];
  private options: ScannerOptions;
  private itemMap: Map<string, ManifestItem[]>;
  private configList: ConfigObject[];
  private configHandle: ConfigurationHandler;

  constructor(options: Partial<ScannerOptions> = {}) {
    this.options = {
      appName: 'app',
      needWriteFile: true,
      useRelativePath: false,
      configDir: DEFAULT_CONFIG_DIR,
      loaderListGenerator: (defaultLoaderList: string[]) => defaultLoaderList,
      ...options,
      excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
      extensions: [...new Set(this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']))],
    };

    this.itemMap = new Map(
      this.options.loaderListGenerator(DEFAULT_LOADER_LIST_WITH_ORDER)
        .map((loaderNameOrClazz) => {
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
    this.configList = [];
    this.configHandle = new ConfigurationHandler();
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
    const config = await this.getAllConfig(root, env);

    // 1. scan all file in framework
    const frameworkDirs = await this.getFrameworkDirs(config.framework, root, env);
    for (const frameworkDir of frameworkDirs) {
      await this.walk(frameworkDir, this.formatWalkOptions('framework', frameworkDir));
    }

    // 2. scan all file in plugin
    this.configList.forEach(config => this.configHandle.setConfig(env, config));
    const { plugin } = this.configHandle.getMergedConfig(env);
    const pluginSortedList = await PluginFactory.createFromConfig(plugin || {});
    for (const plugin of pluginSortedList.reverse()) {
      if (!plugin.enable) continue;
      this.setPluginMeta(plugin);
      await this.walk(plugin.importPath,
        this.formatWalkOptions('plugin', plugin.importPath, plugin.name, plugin.metadata.configDir));
    };

    // 3. scan all file in app
    await this.walk(root, this.formatWalkOptions('app', root, ''));

    const result: Manifest = {
      items: this.getItemsFromMap()
    }
    return result;
  }

  private async walk(root: string, options: WalkOptions) {
    await new Walk(options).start(root);
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

  private async getAllConfig(root: string, env: string) {
    const { configDir } = this.options;
    const configFileList = await fs.readdir(path.resolve(root, configDir));
    const container = new Container(ArtusInjectEnum.DefaultContainerName);
    container.set({ type: ConfigurationHandler });
    const configHandler = new ConfigLoader(container);
    for (const pluginConfigFile of configFileList) {
      await configHandler.load({
        path: path.join(root, configDir, pluginConfigFile),
        extname: path.basename(pluginConfigFile),
        filename: pluginConfigFile
      });
    }
    const config = container.get(ConfigurationHandler).getMergedConfig(env);
    this.configList.unshift(config);
    return config;
  }

  private async getFrameworkDirs(config: FrameworkConfig, root: string,
    env: string, dirs: string[] = []): Promise<string[]> {
    if (!config || (!config.path && !config.package)) {
      return dirs;
    }

    const frameworkBaseDir = await FrameworkHandler.handle(root, config);
    dirs.unshift(frameworkBaseDir);

    // scan recurse
    const configInFramework = await this.getAllConfig(frameworkBaseDir, env);
    return await this.getFrameworkDirs(configInFramework.framework, frameworkBaseDir, env, dirs);
  }

  private formatWalkOptions(source: string, baseDir: string, unitName?: string, configDir?: string): WalkOptions {
    const commonOptions = {
      extensions: this.options.extensions,
      excluded: this.options.excluded,
      itemMap: this.itemMap,
    }

    unitName ??= baseDir;
    configDir ??= this.options.configDir;

    return Object.assign({}, commonOptions, { source, baseDir, unitName, configDir });
  }

  private getItemsFromMap(): ManifestItem[] {
    let items: ManifestItem[] = [];
    for (const [, unitItems] of this.itemMap) {
      items = items.concat(unitItems);
    }
    return items;
  }

  private async writeFile(filename: string = 'manifest.json', data: string) {
    await fs.writeFile(filename, data);
  }
}