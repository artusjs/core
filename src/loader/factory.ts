import { Container } from '@artus/injection';
import { ArtusInjectEnum, DEFAULT_LOADER } from '../constraints';
import { Manifest, ManifestItem, LoaderConstructor, LoaderHookUnit } from './types';
import ConfigurationHandler, { Framework } from '../configuration';
import { LifecycleManager } from '../lifecycle';

export const configSet = {
  framework: new Set<string>(),
  plugin: new Set<string>(),
};

export class LoaderFactory {
  private container: Container;
  private envUnits: string[];
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();

  static registerLoader(loaderName: string, clazz: LoaderConstructor) {
    this.loaderClazzMap.set(loaderName, clazz);
  }

  constructor(container: Container, envUnits: string[] = []) {
    this.container = container;
    this.envUnits = [
      ...envUnits,
      'framework-config'
    ]
  }

  static create(container: Container, envUnits: string[] = []): LoaderFactory {
    return new LoaderFactory(container, envUnits);
  }

  async loadEnvUnits(manifest: Manifest): Promise<void> {
    const items = manifest.items.filter(item => this.envUnits.includes(item.loader ?? ''));
    const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);

    if (!items.length) {
      this.container.set({
        id: ArtusInjectEnum.Frameworks,
        value: configurationHandler.getFrameworks()
      });
      return;
    }

    await this.loadItemList(items, {
      ['framework-config']: {
        after: () => this.container.set({
          id: ArtusInjectEnum.Frameworks,
          value: configurationHandler.getFrameworks()
        })
      }
    });
  };

  filterUnusedFrameworkFiles(manifest: Manifest, frameworks: Map<string, Framework>): Manifest {
    const dropFiles: string[] = [];
    for (const [, { drop }] of frameworks.entries()) {
      if (!drop) {
        continue;
      }
      dropFiles.push(...drop.map(item => item.path));
    }
    manifest.items = manifest.items.filter(item => item.loader !== 'framework-config'
      && dropFiles.every(ignorePath => !item.path.startsWith(ignorePath)));

    return manifest;
  }

  async loadManifest(manifest: Manifest, frameworks: Map<string, Framework> = new Map<string, Framework>()): Promise<void> {
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);
    const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);

    manifest = this.filterUnusedFrameworkFiles(manifest, frameworks);
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
      },
      'package-json': {
        after: () => this.container.set({
          id: ArtusInjectEnum.Packages,
          value: configurationHandler.getPackages()
        })
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
