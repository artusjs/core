import { LoaderFactory } from './factory';
import { Manifest, ManifestItem, Loader, LoaderConstructor } from './types';
import { DefineLoader } from './decorator';
import BaseLoader from './base';

// Import inner impls
import * as LoaderImpls from './impl';

// Register inner impls
for (const [_, impl] of Object.entries(LoaderImpls)) {
  LoaderFactory.register(impl);
}

export {
  // Decorator
  DefineLoader,

  // Class
  LoaderFactory,
  BaseLoader,

  // Typings
  Loader,
  LoaderConstructor,
  Manifest,
  ManifestItem,
};
