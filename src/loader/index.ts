import { LoaderFactory } from './factory';
import { Manifest, ManifestItem, Loader, LoaderConstructor } from './types';
import { DefineLoader } from './decorator';

// Import inner impls
import './impl';

export {
  // Decorator
  DefineLoader,

  // Class
  LoaderFactory,

  // Typings
  Loader,
  LoaderConstructor,
  Manifest,
  ManifestItem,
};
