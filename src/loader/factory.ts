import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER } from '../constraints';
import { Manifest, ManifestItem, LoaderConstructor, LoaderHookUnit } from './types';
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
    const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);

    await this.loadItemList(manifest.items, {
      config: {
        before: () => lifecycleManager.emitHook('configWillLoad'),
        after: () => {
          this.container.set({
            id: ArtusInjectEnum.Config,
            value: configurationHandler.getMergedConfig()
          });
          lifecycleManager.emitHook('configDidLoad');
        }
      }
    });
  }

  async loadItemList(itemList: ManifestItem[] = [], hookMap?: Record<string, LoaderHookUnit>): Promise<void> {
    let prevLoader: string = '';
    for (const item of itemList) {
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
}
