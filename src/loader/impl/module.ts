import { Container, InjectableDefinition } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    try {
      const moduleObj = await import(item.path);
      const moduleClazz = moduleObj?.default ?? moduleObj;
      const opts: Partial<InjectableDefinition> = {
        path: item.path,
        type: moduleClazz
      };
      if (item.id) {
        opts.id = item.id;
      }
      this.container.set(opts);
    } catch (error) {
      console.error(error);
    }
  }
}

export default ModuleLoader;
