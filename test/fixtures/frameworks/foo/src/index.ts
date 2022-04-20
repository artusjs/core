import { ArtusApplication } from '../../../../../src';
import { server } from './app';

export class FrameworkFoo extends ArtusApplication {
  isListening() {
    return server?.listening;
  }
}
