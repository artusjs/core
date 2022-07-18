import {
  ArtusApplication,
  ApplicationLifecycle, LifecycleHookUnit, LifecycleHook, ArtusInjectEnum,
} from '../../../src/index';

import { Container, Inject } from '@artus/injection';
import Custom from './custom';

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  container: Container;

  @LifecycleHook()
  configDidLoad() {
    this.container.set({ id: Custom, value: new Custom('foo') });
  }

  @LifecycleHook()
  async beforeClose() {
    console.log(this.container.get(Custom));
  }
}