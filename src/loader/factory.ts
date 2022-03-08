import { Container } from '@artusjs/injection';
import { DEFAULT_LOADER } from '../constraints';
import { Manifest, ManifestUnit, LoaderConstructor } from './types';

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
    for (const unit of manifest.units) {
      await this.loadUnit(unit);
    }
  }

  async loadUnit(unit: ManifestUnit): Promise<void> {
    const LoaderClazz = LoaderFactory.loaderClazzMap.get(unit.loader || DEFAULT_LOADER);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${unit.loader}'`);
    }
    const loader = new LoaderClazz(this.container);
    await loader.load(unit);
  }
}
