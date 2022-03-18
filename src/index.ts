export {
  Inject,
  Injectable
} from '@artus/injection';

export * from './loader';
export * from './lifecycle';

export * from './application';
export * from './trigger';

export type {
  Manifest
} from './loader/types';

// IoC
import { Container } from '@artus/injection';
import { ArtusApplication } from './application';
import { ARTUS_DEFAULT_CONTAINER } from './constraints';
import { Trigger } from './trigger';
export const artusContainer = new Container(ARTUS_DEFAULT_CONTAINER);
artusContainer.set({ type: ArtusApplication });
artusContainer.set({ type: Trigger });
