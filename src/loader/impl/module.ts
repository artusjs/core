import { Loader } from '..';
import { DefineLoader } from '../loaderStore';
import { ManifestUnit } from '../../typings';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Record<string, any>;

  constructor(container) {
    this.container = container;
  }

  async load(unit: ManifestUnit) {
    console.log(unit.path);
    const moduleObj = await import(unit.path);
    const moduleClazz = moduleObj.default;
    const metaData = moduleObj.__META__;
    console.log('metaData', metaData);
    console.log('moduleClazz', moduleClazz);
    this.container.set(metaData.key, new moduleClazz());
    console.log('container', this.container);
  }
}

export default ModuleLoader;