import { Container } from '@artus/injection';
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
      this.container.set({
        // id: moduleClazz,
        id: item.id,
        path: item.path,
        type: moduleClazz
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default ModuleLoader;
