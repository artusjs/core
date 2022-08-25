import { Constructable, Container } from '@artus/injection';
import { ArtusInjectEnum } from '../../constant';
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
    return this.container.get(ArtusInjectEnum.LifecycleManager);
  }

  async load(item: ManifestItem) {
    const origin: Constructable<ApplicationLifecycle>[] = await compatibleRequire(item.path, true);
    item._loaderState = Object.assign({ exportNames: ['default'] }, item._loaderState);
    const { _loaderState: state } = item as { _loaderState: { exportNames: string[] } };

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
