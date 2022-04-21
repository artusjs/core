import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ARTUS_DEFAULT_CONFIG_ENV } from '../../constraints';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible-require';

@DefineLoader('framework')
class FrameworkLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.setConfig(ARTUS_DEFAULT_CONFIG_ENV.DEFAULT, { frameworks: [originConfigObj] });
  }
}

export default FrameworkLoader;
