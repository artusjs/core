import {
  ArtusApplication,
  ApplicationLifecycle, LifecycleHookUnit, LifecycleHook, ArtusInjectEnum,
} from '../../../src/index';

import { Container, Inject } from '@artus/injection';
import LifecycleList from './lifecyclelist';

@LifecycleHookUnit()
export class AppReadyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  container: Container;

  @Inject()
  lifecycleList: LifecycleList;

  @LifecycleHook('willReady')
  async willReady() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_willReady');
  }

  @LifecycleHook('didReady')
  async didReady() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_didReady');
  }

  @LifecycleHook()
  async beforeClose() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_beforeClose');
  }
}
