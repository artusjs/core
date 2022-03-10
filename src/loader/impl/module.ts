import { Container } from '@artusjs/injection';
import { DefineLoader } from '../decorator';
import { ManifestUnit, Loader } from '../types';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(unit: ManifestUnit) {
    try {
      const moduleObj = await import(unit.path);
      const moduleClazz = moduleObj?.default ?? moduleObj;
      this.container.set({
        // id: moduleClazz,
        id: unit.id,
        path: unit.path,
        type: moduleClazz
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default ModuleLoader;
