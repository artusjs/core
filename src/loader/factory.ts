import * as path from 'path';
import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER, LOADER_NAME_META, DEFAULT_LOADER_LIST_WITH_ORDER } from '../constant';
import {
  Manifest,
  ManifestItem,
  LoaderConstructor,
  Loader,
} from './types';
import ConfigurationHandler from '../configuration';
import { LifecycleManager } from '../lifecycle';
import LoaderEventEmitter, { LoaderEventListener } from './loader_event';

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

  static create(container: Container): LoaderFactory {
    return new LoaderFactory(container);
  }

  get lifecycleManager(): LifecycleManager {
    return this.container.get(ArtusInjectEnum.LifecycleManager);
  }

  get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
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

  async loadManifest(manifest: Manifest, root?: string): Promise<void> {
    await this.loadItemList(manifest.items, root);
  }

  async loadItemList(itemList: ManifestItem[] = [], root?: string): Promise<void> {
    const itemMap = new Map(DEFAULT_LOADER_LIST_WITH_ORDER.map(loaderName => [loaderName, []]));

    // group by loader names
    for (const item of itemList) {
      if (!itemMap.has(item.loader)) {
        // compatible for custom loader
        itemMap.set(item.loader, []);
      }
      itemMap.get(item.loader)!.push({
        ...item,
        path: root ? path.join(root, item.path) : item.path,
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
