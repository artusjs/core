import { Container } from '@artus/injection';
import { ArtusInjectEnum, ArtusInjectPrefix, DEFAULT_LOADER, HOOK_CONFIG_HANDLE } from '../constraints';
import { Manifest, ManifestItem, LoaderConstructor, LoaderHookUnit } from './types';
import ConfigurationHandler, { EnvUnit } from '../configuration';
import { LifecycleManager } from '../lifecycle';

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
      'plugin-config',
      'framework-config'
    ]
  }

  static create(container: Container, envUnits: string[] = []): LoaderFactory {
    return new LoaderFactory(container, envUnits);
  }

  async setContainer(envUnit: string) {
    const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);
    const propertyKey = Reflect.getMetadata(`${HOOK_CONFIG_HANDLE}${envUnit}`, ConfigurationHandler);
    this.container.set({
      id: `${ArtusInjectPrefix}${envUnit}`,
      value: await configurationHandler[propertyKey]()
    })
  }

  async loadEnvUnits(manifest: Manifest): Promise<void> {
    const items = manifest.items.filter(item => this.envUnits.includes(item.loader ?? ''));

    // set loader hook
    const loaderHooks = {};
    for (const envUnit of this.envUnits) {
      await this.setContainer(envUnit);
      loaderHooks[envUnit] = {
        after: async () => await this.setContainer(envUnit)
      };
    }

    await this.loadItemList(items, loaderHooks);
  };

  async filterUnusedFilesByEnv(manifest: Manifest): Promise<Manifest> {
    const ignoreFiles: string[] = [];
    for (const envUnit of this.envUnits) {
      const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);
      const propertyKey = Reflect.getMetadata(`${HOOK_CONFIG_HANDLE}${envUnit}`, ConfigurationHandler);
      const units: Map<string, EnvUnit> = await configurationHandler[propertyKey]();
      for (const [, { ignore }] of units.entries()) {
        if (!ignore) {
          continue;
        }
        ignoreFiles.push(...ignore.map(item => item.path));
      }
    }

    manifest.items = manifest.items.filter(item =>
      !this.envUnits.includes(item.loader ?? '')
      && ignoreFiles.every(ignoreFile => !item.path.startsWith(ignoreFile))
    );

    return manifest;
  }

  async loadManifest(manifest: Manifest): Promise<void> {
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);
    const configurationHandler: ConfigurationHandler = this.container.get(ConfigurationHandler);

    manifest = await this.filterUnusedFilesByEnv(manifest);
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
