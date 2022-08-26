import {
  ArtusApplication,
  ApplicationLifecycle, LifecycleHookUnit, LifecycleHook, ArtusInjectEnum,
} from '../../../src/index';

import { Container, Inject } from '@artus/injection';
import LifecycleList from './lifecyclelist';
export const TEST_LIFE_CYCLE_LIST = 'TEST_LIFE_CYCLE_LIST';

@LifecycleHookUnit()
export default class AppLoadLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  container: Container;

  @Inject()
  lifecycleList: LifecycleList;

  @LifecycleHook()
  async configWillLoad() {
    this.container.set({ id: TEST_LIFE_CYCLE_LIST, value: this.lifecycleList });
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_configWillLoad');
  }

  @LifecycleHook('configDidLoad')
  async customNameConfigDidLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_configDidLoad');
  }

  @LifecycleHook('didLoad')
  async  didLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('app_didLoad');
  }
}
