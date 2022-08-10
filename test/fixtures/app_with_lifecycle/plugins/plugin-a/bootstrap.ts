import {
  ArtusApplication,
  ApplicationLifecycle, LifecycleHookUnit, LifecycleHook, ArtusInjectEnum,
} from '../../../../../src';

import { Container, Inject } from '@artus/injection';
import LifecycleList from '../../lifecyclelist';

@LifecycleHookUnit()
export default class AppLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  container: Container;

  @Inject()
  lifecycleList: LifecycleList;

  @LifecycleHook()
  async configWillLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_configWillLoad');
  }

  @LifecycleHook('configDidLoad')
  async customNameConfigDidLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_configDidLoad');
  }

  @LifecycleHook('didLoad')
  async  didLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_didLoad');
  }

  @LifecycleHook('willReady')
  async willReady() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_willReady');
  }

  @LifecycleHook('didReady')
  async didReady() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_didReady');
  }

  @LifecycleHook()
  async beforeClose() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lifecycleList.add('pluginA_beforeClose');
  }
}
