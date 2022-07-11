import * as path from 'path';
import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER, HOOK_FILE_LOADER, LOADER_NAME_META } from '../constant';
import {
  Manifest,
  ManifestItem,
  LoaderConstructor,
  Loader,
  LoaderFindOptions,
  LoaderFindResult,
} from './types';
import ConfigurationHandler from '../configuration';
import { LifecycleManager } from '../lifecycle';
import compatibleRequire from '../utils/compatible_require';
import LoaderEventEmitter, { LoaderEventListener } from './loader_event';

export class LoaderFactory {
  private container: Container;
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();
  private loaderEvent: LoaderEventEmitter;

  static register(clazz: LoaderConstructor) {
    const loaderName = Reflect.getMetadata(LOADER_NAME_META, clazz);
    this.loaderClazzMap.set(loaderName, clazz);
  }

  constructor(container: Container) {
    this.container = container;
    this.loaderEvent = new LoaderEventEmitter();
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
    this.loaderEvent.addListener(eventName, listener);
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
    let prevLoader: string = '';
    for (const item of itemList) {
      item.path = root ? path.join(root, item.path) : item.path;
      const curLoader = item.loader ?? DEFAULT_LOADER;
      if (item.loader !== prevLoader) {
        if (prevLoader) {
          await this.loaderEvent.emitAfter(prevLoader);
        }
        await this.loaderEvent.emitBefore(curLoader);
        prevLoader = curLoader;
      }
      await this.loadItem(item);
    }
    if (prevLoader) {
      await this.loaderEvent.emitAfter(prevLoader);
    }
  }

  async loadItem(item: ManifestItem): Promise<void> {
    const loaderName = item.loader || DEFAULT_LOADER;
    const loader = this.getLoader(loaderName);
    loader.state = item._loaderState;
    await loader.load(item);
  }

  async findLoader(opts: LoaderFindOptions): Promise<LoaderFindResult> {
    const loaderName = await this.findLoaderName(opts);
    const loaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
    if (!loaderClazz) {
      throw new Error(`Cannot find loader '${loaderName}'`);
    }
    const result: LoaderFindResult = {
      loaderName,
    };
    if (loaderClazz.onFind) {
      result.loaderState = await loaderClazz.onFind(opts);
    }
    return result;
  }

  async findLoaderName(opts: LoaderFindOptions): Promise<string> {
    for (const [loaderName, LoaderClazz] of LoaderFactory.loaderClazzMap.entries()) {
      if (await LoaderClazz.is?.(opts)) {
        return loaderName;
      }
    }
    const { root, filename } = opts;

    // get loader from reflect metadata
    const target = await compatibleRequire(path.join(root, filename));
    const metadata = Reflect.getMetadata(HOOK_FILE_LOADER, target);
    if (metadata?.loader) {
      return metadata.loader;
    }

    // default loder
    return DEFAULT_LOADER;
  }
}
