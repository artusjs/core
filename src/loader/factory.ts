import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER } from '../constraints';
import { PluginFactory } from '../plugin';
import { Manifest, ManifestItem, LoaderConstructor } from './types';
import ConfigurationHandler from '../configuration';
import { LifecycleManager } from '../lifecycle';

export class LoaderFactory {
  private container: Container;
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();

  static registerLoader(loaderName: string, clazz: LoaderConstructor) {
    this.loaderClazzMap.set(loaderName, clazz);
  }

  constructor (container: Container) {
    this.container = container;
  }

  static create(container: Container): LoaderFactory {
    return new LoaderFactory(container);
  }

  async loadManifest(manifest: Manifest): Promise<void> {
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);

    // 0. Load Plugin Config
    if (manifest.app.pluginConfig) {
      await this.loadItemList(manifest.app.pluginConfig.map(item => ({
        ...item,
        manifest: manifest.plugins?.[item.id]
      })), 'config');
    }

    // 1. Calculate Plugin Load Order
    const configHandler = this.container.get(ConfigurationHandler);
    const { plugin: pluginConfig } = await configHandler.getMergedConfig();
    const pluginSortedList = await PluginFactory.createFromConfig(pluginConfig || {});

    const loadUnitList = [
      'extension', // 2. Load Extension
      'config', // 3. Load Config
      'exception', // 4. Load Exception Definition
      ['items', 'module']// 5. Load Other Items
    ];
    for (const loadUnit of loadUnitList) {
      let manifestKey: string;
      let loaderName: string;
      if (Array.isArray(loadUnit)) {
        [manifestKey, loaderName] = loadUnit;
      } else {
        manifestKey = loadUnit;
        loaderName = loadUnit;
      }
      if (manifestKey === 'config') {
        await lifecycleManager.emitHook('configWillLoad');
      }
      // load unit from plugins
      for (const plugin of pluginSortedList) {
        const pluginManifest = manifest.plugins?.[plugin.name] ?? {};
        await this.loadItemList(pluginManifest[manifestKey], loaderName);
      }
      // load unit from app
      await this.loadItemList(manifest.app[manifestKey], loaderName);
      if (manifestKey === 'config') {
        this.container.set({
          id: ArtusInjectEnum.Config,
          value: await configHandler.getMergedConfig()
        });
        await lifecycleManager.emitHook('configDidLoad');
      }
    }
  }

  async loadItemList(itemList: ManifestItem[] = [], loaderName?: string): Promise<void> {
    for (const item of itemList) {
      await this.loadItem(item, loaderName);
    }
  }

  async loadItem(item: ManifestItem, loaderName?: string): Promise<void> {
    loaderName = loaderName || item.loader || DEFAULT_LOADER;
    const LoaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${loaderName}'`);
    }
    const loader = new LoaderClazz(this.container);
    await loader.load(item);
  }
}
