import { LifecycleHookUnit, LifecycleHook } from '../../../../../src/decorator';

@LifecycleHookUnit()
export default class Hook {
  @LifecycleHook()
  async willReady() {
    console.log('Redis Plugin will ready');
  }
}
