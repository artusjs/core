import {
  ArtusApplication,
  ApplicationLifecycle, LifecycleHookUnit, LifecycleHook,
  WithApplication, WithContainer
} from '../../../src/index';

import { Container } from '@artus/injection';
import Custom from './custom';

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;
  container: Container;

  constructor(@WithApplication() app: ArtusApplication, @WithContainer() container) {
    this.app = app;
    this.container = container;
  }

  @LifecycleHook()
  configDidLoad() {
    this.container.set({ id: Custom, value: new Custom('foo') });
  }

  @LifecycleHook()
  async beforeClose() {
    console.log(this.container.get(Custom))
  }
}