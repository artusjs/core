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

  @LifecycleHook('configWillLoad')
  customConfigWillLoad() {
    this.lifecycleList.add('pluginB_configWillLoad');
  }

  @LifecycleHook('configDidLoad')
  customNameConfigDidLoad() {
    this.lifecycleList.add('pluginB_configDidLoad');
  }

  @LifecycleHook('didLoad')
   didLoad() {
    this.lifecycleList.add('pluginB_didLoad');
  }

  @LifecycleHook('willReady')
  willReady() {
    this.lifecycleList.add('pluginB_willReady');
  }

  @LifecycleHook('didReady')
  didReady() {
    this.lifecycleList.add('pluginB_didReady');
  }

  @LifecycleHook()
  beforeClose() {
    this.lifecycleList.add('pluginB_beforeClose');
  }
}
