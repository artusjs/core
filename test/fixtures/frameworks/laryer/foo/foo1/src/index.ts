import { ArtusApplication } from '../../../../../../../src';
import { server } from './lifecycle';

export class FrameworkFoo extends ArtusApplication {
  isListening(): boolean {
    return server?.listening;
  }
}
