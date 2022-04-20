import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ARTUS_DEFAULT_CONFIG_ENV } from '../../constraints';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible-require';

@DefineLoader('package-json')
class ConfigLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.setConfig(ARTUS_DEFAULT_CONFIG_ENV.DEFAULT, { packages: [originConfigObj] });
  }
}

export default ConfigLoader;
