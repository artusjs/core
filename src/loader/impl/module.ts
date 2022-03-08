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
      const moduleClazz = moduleObj.default;
      const metaData = moduleObj.__META__;
      console.log('metaData', metaData);
      console.log('moduleClazz', moduleClazz);
      this.container.set({
        // id: moduleClazz,
        type: moduleClazz
      });
      console.log('container', this.container);
    } catch (error) {
      console.error(error);
    }
  }
}

export default ModuleLoader;