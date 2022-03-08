import { Container } from '@artusjs/injection';
import { Loader } from '..';
import { DefineLoader } from '../loaderStore';
import { ManifestUnit } from '../../typings';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(unit: ManifestUnit) {
    console.log(unit.path);
    try {
      const moduleObj = await import(unit.path);
      const moduleClazz = moduleObj?.default ?? moduleObj;
      console.log('moduleClazz', moduleClazz);
      this.container.set({
        // id: moduleClazz,
        id: unit.id,
        path: unit.path,
        type: moduleClazz
      });
      console.log('container', this.container);
    } catch (error) {
      console.error(error);
    }
  }
}

export default ModuleLoader;
