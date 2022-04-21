import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible-require';

@DefineLoader('package-json')
class PackageLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.addPackage(item.source || 'app', originConfigObj);
  }
}

export default PackageLoader;
