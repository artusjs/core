import { Container, InjectableDefinition } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible-require';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const moduleClazz = await compatibleRequire(item.path);
    const opts: Partial<InjectableDefinition> = {
      path: item.path,
      type: moduleClazz
    };
    if (item.id) {
      opts.id = item.id;
    }
    this.container.set(opts);
  }
}

export default ModuleLoader;
