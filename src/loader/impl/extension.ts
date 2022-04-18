import { Constructable, Container } from '@artus/injection';
import { ArtusInjectEnum } from '../../constraints';
import { LifecycleManager } from '../../lifecycle';
import { ApplicationLifecycle } from '../../types';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../utils/compatible-require';

@DefineLoader('extension')
class ExtensionLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const extClazz: Constructable<ApplicationLifecycle> = await compatibleRequire(item.path);
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);
    lifecycleManager.registerExtension(extClazz);
  }
}

export default ExtensionLoader;
