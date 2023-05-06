import { Constructable, Container } from '@artus/injection';
import { LifecycleManager } from '../../lifecycle';
import { ApplicationLifecycle } from '../../types';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible_require';

@DefineLoader('lifecycle-hook-unit')
class LifecycleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  get lifecycleManager(): LifecycleManager {
    return this.container.get(LifecycleManager);
  }

  async load(item: ManifestItem) {
    const origin: Constructable<ApplicationLifecycle>[] = await compatibleRequire(item.path, true);
    item.loaderState = Object.assign({ exportNames: ['default'] }, item.loaderState);
    const { loaderState: state } = item as { loaderState: { exportNames: string[] } };

    const lifecycleClazzList = [];

    for (const name of state.exportNames) {
      const clazz = origin[name];
      this.container.set({ type: clazz });
      this.lifecycleManager.registerHookUnit(clazz);
    }

    return lifecycleClazzList;
  }
}

export default LifecycleLoader;
