import * as path from 'path';
import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER, LOADER_NAME_META, DEFAULT_LOADER_LIST_WITH_ORDER, ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV, DEFAULT_APP_REF } from '../constant';
import {
  Manifest,
  ManifestItem,
  LoaderConstructor,
  Loader,
} from './types';
import ConfigurationHandler from '../configuration';
import { LifecycleManager } from '../lifecycle';
import LoaderEventEmitter, { LoaderEventListener } from './loader_event';
import { PluginConfigItem, PluginFactory } from '../plugin';
import { Logger, LoggerType } from '../logger';

export class LoaderFactory {
  public static loaderClazzMap: Map<string, LoaderConstructor> = new Map();

  static register(clazz: LoaderConstructor) {
    const loaderName = Reflect.getMetadata(LOADER_NAME_META, clazz);
    this.loaderClazzMap.set(loaderName, clazz);
  }

  private container: Container;
  private loaderEmitter: LoaderEventEmitter;

  constructor(container: Container) {
    this.container = container;
    this.loaderEmitter = new LoaderEventEmitter();
  }

  get lifecycleManager(): LifecycleManager {
    return this.container.get(ArtusInjectEnum.LifecycleManager);
  }

  get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
  }

  get logger(): LoggerType {
    return this.container.get(Logger);
  }

  addLoaderListener(eventName: string, listener: LoaderEventListener) {
    this.loaderEmitter.addListener(eventName, listener);
    return this;
  }

  removeLoaderListener(eventName: string, stage?: 'before' | 'after') {
    this.loaderEmitter.removeListener(eventName, stage);
    return this;
  }

  getLoader(loaderName: string): Loader {
    const LoaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${loaderName}'`);
    }
    return new LoaderClazz(this.container);
  }

  async loadManifest(
    manifest: Manifest,
    root: string = process.cwd(),
    envList: string[] = [process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV],
  ): Promise<void> {
    if (!('version' in manifest) || manifest.version !== '2') {
      throw new Error(`invalid manifest, @artus/core@2.x only support manifest version 2.`);
    }
    // Manifest Version 2 is supported mainly

    // Merge plugin config with ref
    const validEnvList = [ARTUS_DEFAULT_CONFIG_ENV.DEFAULT as string].concat(envList);
    for (const env of validEnvList) {
      this.configurationHandler.setConfig(env, {
        plugin: manifest.pluginConfig?.[env] ?? {},
      });
    }
    const mergedPluginConfig: Record<string, PluginConfigItem> = this.configurationHandler.getAllConfig()?.plugin ?? {};
    for (const [pluginName, pluginConfigItem] of Object.entries(mergedPluginConfig)) {
      const refItem = manifest.refMap[pluginConfigItem.refName];
      if (!refItem) {
        continue;
      }
      mergedPluginConfig[pluginName] = {
        ...pluginConfigItem,
        metadata: refItem.pluginMetadata, 
      };
    }

    // sort ref(plugin) firstly
    const sortedPluginList = await PluginFactory.createFromConfig(mergedPluginConfig, {
      logger: this.logger,
    });

    // Merge itemList
    let itemList: ManifestItem[] = [];
    const sortedRefNameList: (string | null)[] = sortedPluginList
      .map(plugin => ((plugin.enable && mergedPluginConfig[plugin.name]?.refName) || null))
      .concat([DEFAULT_APP_REF]);
    for (const refName of sortedRefNameList) {
      const refItem = manifest.refMap[refName];
      itemList = itemList.concat(refItem.items);
    }

    // Load final item list(non-ordered)
    await this.loadItemList(itemList, root);
  }

  async loadItemList(itemList: ManifestItem[] = [], root?: string): Promise<void> {
    const itemMap = new Map(DEFAULT_LOADER_LIST_WITH_ORDER.map(loaderName => [loaderName, []]));

    // group by loader names
    for (const item of itemList) {
      if (!itemMap.has(item.loader)) {
        // compatible for custom loader
        itemMap.set(item.loader, []);
      }
      let resolvedPath = item.path;
      if (root && !path.isAbsolute(resolvedPath)) {
        resolvedPath = path.resolve(root, resolvedPath);
      }
      itemMap.get(item.loader)!.push({
        ...item,
        path: resolvedPath,
        loader: item.loader ?? DEFAULT_LOADER,
      });
    }

    // trigger loader
    for (const [loaderName, itemList] of itemMap) {
      await this.loaderEmitter.emitBefore(loaderName);

      for (const item of itemList) {
        const curLoader = item.loader;
        await this.loaderEmitter.emitBeforeEach(curLoader, item);
        const result = await this.loadItem(item);
        await this.loaderEmitter.emitAfterEach(curLoader, item, result);
      }

      await this.loaderEmitter.emitAfter(loaderName);
    }
  }

  loadItem(item: ManifestItem): Promise<any> {
    const loaderName = item.loader || DEFAULT_LOADER;
    const loader = this.getLoader(loaderName);
    loader.state = item.loaderState;
    return loader.load(item);
  }
}
