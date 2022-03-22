import { Container } from '@artus/injection';
import { DEFAULT_LOADER } from '../constraints';
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

  // TODO: get all config files by default env
  getTypeFiles() {

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
