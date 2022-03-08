import { Container } from '@artusjs/injection';
import { DEFAULT_LOADER } from '../constraints';
import { Manifest, ManifestUnit } from '../typings';
import { getLoaderClazz, DefineLoader } from './loaderStore';

// Import inner impls
import './impl';

interface LoaderConstructor {
  new(container: Container): Loader;
};
interface Loader {
  load(unit: ManifestUnit): Promise<void>;
};

class LoaderFactory {
  private container: Container;

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
    const LoaderClazz = getLoaderClazz(unit.loader || DEFAULT_LOADER);
    if (!LoaderClazz) {
      throw new Error(`Cannot find loader '${unit.loader}'`);
    }
    const loader = new LoaderClazz(this.container);
    await loader.load(unit);
  }
}

export {
  DefineLoader,
  Loader,
  LoaderConstructor,
  LoaderFactory
};
