import * as path from 'path';
import { isInjectable, Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER, HOOK_FILE_LOADER, LOADER_NAME_META, ScanPolicy, DEFAULT_LOADER_LIST_WITH_ORDER } from '../constant';
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
import { isClass } from '../utils/is';

export class LoaderFactory {
  private container: Container;
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();
  private loaderEmitter: LoaderEventEmitter;

  static register(clazz: LoaderConstructor) {
    const loaderName = Reflect.getMetadata(LOADER_NAME_META, clazz);
    this.loaderClazzMap.set(loaderName, clazz);
  }

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
      item.path = root ? path.join(root, item.path) : item.path;
      item.loader = item.loader ?? DEFAULT_LOADER;
      if (!itemMap.has(item.loader)) {
        // compatible for custom loader
        itemMap.set(item.loader, []);
      }
      itemMap.get(item.loader)!.push(item);
    }

    // trigger loader
    for (const [ loaderName, itemList ] of itemMap) {
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

  async findLoader(opts: LoaderFindOptions): Promise<LoaderFindResult | null> {
    const { loader: loaderName, exportNames } = await this.findLoaderName(opts);

    if (!loaderName) {
      return null;
    }

    const loaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
    if (!loaderClazz) {
      throw new Error(`Cannot find loader '${loaderName}'`);
    }
    const result: LoaderFindResult = {
      loaderName,
      loaderState: { exportNames },
    };
    if (loaderClazz.onFind) {
      result.loaderState = await loaderClazz.onFind(opts);
    }
    return result;
  }

  async findLoaderName(opts: LoaderFindOptions): Promise<{ loader: string | null, exportNames: string[] }> {
    for (const [loaderName, LoaderClazz] of LoaderFactory.loaderClazzMap.entries()) {
      if (await LoaderClazz.is?.(opts)) {
        return { loader: loaderName, exportNames: [] };
      }
    }
    const { root, filename, policy = ScanPolicy.All } = opts;

    // require file for find loader
    const allExport = await compatibleRequire(path.join(root, filename), true);
    const exportNames: string[] = [];

    let loaders = Object.entries(allExport)
      .map(([name, targetClazz]) => {
        if (!isClass(targetClazz)) {
          // The file is not export with default class
          return null;
        }

        if (policy === ScanPolicy.NamedExport && name === 'default') {
          return null;
        }

        if (policy === ScanPolicy.DefaultExport && name !== 'default') {
          return null;
        }

        // get loader from reflect metadata
        const loaderMd = Reflect.getMetadata(HOOK_FILE_LOADER, targetClazz);
        if (loaderMd?.loader) {
          exportNames.push(name);
          return loaderMd.loader;
        }

        // default loder with @Injectable
        const injectableMd = isInjectable(targetClazz);
        if (injectableMd) {
          exportNames.push(name);
          return DEFAULT_LOADER;
        }
      })
      .filter(v => v);

    loaders = Array.from(new Set(loaders));

    if (loaders.length > 1) {
      throw new Error(`Not support multiple loaders for ${path.join(root, filename)}`);
    }

    return { loader: loaders[0] ?? null, exportNames };
  }
}
