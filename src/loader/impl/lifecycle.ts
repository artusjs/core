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

  async load(item: ManifestItem) {
    const extClazz: Constructable<ApplicationLifecycle> = await compatibleRequire(item.path);
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);
    lifecycleManager.registerHookUnit(extClazz);
    return extClazz;
  }
}

export default LifecycleLoader;
