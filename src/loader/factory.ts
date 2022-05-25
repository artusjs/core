import * as path from 'path';
import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER, HOOK_FILE_LOADER, LOADER_NAME_META } from '../constraints';
import { Manifest, ManifestItem, LoaderConstructor, LoaderHookUnit, LoaderCheckOptions } from './types';
import ConfigurationHandler from '../configuration';
import { LifecycleManager } from '../lifecycle';
import compatibleRequire from '../utils/compatible_require';

export class LoaderFactory {
  private container: Container;
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();

  static register(clazz: LoaderConstructor) {
    const loaderName = Reflect.getMetadata(LOADER_NAME_META, clazz);
    this.loaderClazzMap.set(loaderName, clazz);
  }

  constructor(container: Container) {
    this.container = container;
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

  async loadManifest(manifest: Manifest, root?: string): Promise<void> {
    await this.loadItemList(manifest.items, {
      config: {
        before: () => this.lifecycleManager.emitHook('configWillLoad'),
        after: () => {
          this.container.set({
            id: ArtusInjectEnum.Config,
            value: this.configurationHandler.getMergedConfig()
          });
          this.lifecycleManager.emitHook('configDidLoad');
        }
      },
      'framework-config': {
        after: () => this.container.set({
          id: ArtusInjectEnum.Frameworks,
          value: this.configurationHandler.getFrameworkConfig()
        })
      },
      'package-json': {
        after: () => this.container.set({
          id: ArtusInjectEnum.Packages,
          value: this.configurationHandler.getPackages()
        })
      }
    }, root);
  }

  async loadItemList(itemList: ManifestItem[] = [], hookMap?: Record<string, LoaderHookUnit>, root?: string): Promise<void> {
    let prevLoader: string = '';
    for (const item of itemList) {
      item.path = root ? path.join(root, item.path) : item.path;
      const curLoader = item.loader ?? DEFAULT_LOADER;
      if (item.loader !== prevLoader) {
        if (prevLoader) {
          await hookMap?.[prevLoader]?.after?.();
        }
        await hookMap?.[curLoader]?.before?.();
        prevLoader = curLoader;
      }
      await this.loadItem(item);
    }
    if (prevLoader) {
      await hookMap?.[prevLoader]?.after?.();
    }
  }

  async loadItem(item: ManifestItem): Promise<void> {
    const loaderName = item.loader || DEFAULT_LOADER;
    const LoaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${loaderName}'`);
    }
    const loader = new LoaderClazz(this.container);
    await loader.load(item);
  }

  async getLoaderName(opts: LoaderCheckOptions): Promise<string> {
    for (const [loaderName, LoaderClazz] of LoaderFactory.loaderClazzMap.entries()) {
      const loader = new LoaderClazz(this.container);
      if (await loader.is?.(opts)) {
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
