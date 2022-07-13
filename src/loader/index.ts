import { LoaderFactory } from './factory';
import BaseLoader from './base';

// Import inner impls
import * as LoaderImpls from './impl';

// Register inner impls
for (const [_, impl] of Object.entries(LoaderImpls)) {
  LoaderFactory.register(impl);
}

export * from './types';

export {
  // Class
  LoaderFactory,
  BaseLoader,
};
