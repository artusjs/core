export {
  Inject,
  Injectable
} from '@artus/injection';

export * from './loader';
export * from './lifecycle';
export * from './exception';
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
import { ExceptionHandler } from './exception';

export const artusContainer = new Container(ARTUS_DEFAULT_CONTAINER);

artusContainer.set({ type: Trigger });
artusContainer.set({ type: ExceptionHandler });
artusContainer.set({ type: ArtusApplication });

export const getArtusApplication = (): ArtusApplication => artusContainer.get(ArtusApplication);
