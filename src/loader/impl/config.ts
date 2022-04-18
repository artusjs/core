import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV } from '../../constraints';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../utils/compatible-require';

@DefineLoader('config')
class ConfigLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    let [namespace, env, extname] = item.filename.split('.');
    if (!extname) {
      // No env flag, set to Default
      env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    let configObj = originConfigObj;
    if(typeof originConfigObj === 'function') {
      const app = this.container.get(ArtusInjectEnum.Application);
      configObj = originConfigObj(app);
    }
    if (namespace !== 'config') {
      configObj = {
        [namespace]: configObj
      };
    }
    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.setConfig(env, configObj);
  }
}

export default ConfigLoader;
