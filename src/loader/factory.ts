import { Container } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV, DEFAULT_LOADER } from '../constraints';
import { loadFile } from '../utils';
import { mergeConfig } from '../utils/merge';
import { Manifest, ManifestItem, LoaderConstructor } from './types';

export class LoaderFactory {
  private container: Container;
  private static loaderClazzMap: Map<string, LoaderConstructor> = new Map();

  static registerLoader(loaderName: string, clazz: LoaderConstructor) {
    this.loaderClazzMap.set(loaderName, clazz);
  }

  constructor (container: Container) {
    this.container = container;
  }

  static create(container): LoaderFactory {
    return new LoaderFactory(container);
  }

  async loadManifest(manifest: Manifest): Promise<void> {
    for (const item of manifest.items) {
      await this.loadItem(item);
    }
  }

  async loadConfig(manifest: Manifest): Promise<Record<string, any>> {
    const files = this.getTypeFiles();
    let envConfigs = {};
    let defaultConfig = {};
    for (const file of files) {
      const configFile = manifest.items.find(item => item.path.endsWith(`${file.path}.ts`));
      if (!configFile) {
        continue
      }

      const currentConfig = await loadFile(configFile.path);

      if (file.type === ARTUS_DEFAULT_CONFIG_ENV.DEFAULT) {
        defaultConfig = mergeConfig(defaultConfig, currentConfig);
      } else if (file.type === process.env[ARTUS_SERVER_ENV]) {
        envConfigs = mergeConfig(envConfigs, currentConfig);
      }
    }

    return mergeConfig(defaultConfig, envConfigs);
  }


  // TODO:  暂时先忽略插件中的 config
  getTypeFiles(fileType: string = 'config'): ManifestItem[] {
    const files = [{
      path: `${fileType}.${ARTUS_DEFAULT_CONFIG_ENV.DEFAULT}`,
      type: ARTUS_DEFAULT_CONFIG_ENV.DEFAULT as string,
      loader: "module",
    }];
    const env = process.env[ARTUS_SERVER_ENV]
    if (env) {
      files.push({
        type: env,
        path: `${fileType}.${env}`,
        loader: "module",
      });
    }

    return files;
  }

  async loadItem(item: ManifestItem): Promise<void> {
    const LoaderClazz = LoaderFactory.loaderClazzMap.get(item.loader || DEFAULT_LOADER);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${item.loader}'`);
    }
    const loader = new LoaderClazz(this.container);
    await loader.load(item);
  }
}
