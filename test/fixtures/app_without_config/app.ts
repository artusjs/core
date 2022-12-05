import { LifecycleHookUnit, LifecycleHook } from '../../../src/decorator';
import { ApplicationLifecycle } from '../../../src/types';
import { Container, Inject } from '@artus/injection';
import LifecycleList from './lifecyclelist';

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject()
  container: Container;

  @Inject()
  lifecycleList: LifecycleList;
  
  @LifecycleHook()
  async configWillLoad() {
    this.lifecycleList.add('configWillLoad');
  }

  @LifecycleHook()
  async configDidLoad() {
    this.lifecycleList.add('configDidLoad');
  }

  @LifecycleHook('willReady')
  async willReady() {
    this.lifecycleList.add('willReady');
  }

  @LifecycleHook('didReady')
  async didReady() {
    this.lifecycleList.add('didReady');
  }

  @LifecycleHook()
  async beforeClose() {
    this.lifecycleList.add('beforeClose');
  }
}
