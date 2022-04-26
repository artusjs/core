import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible-require';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV } from '../../constraints';

@DefineLoader('framework-config')
class FrameworkLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    let [, env, extname] = item.filename.split('.');
    if (!extname) {
      // No env flag, set to Default
      env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    let configObj = originConfigObj;
    if (typeof originConfigObj === 'function') {
      const app = this.container.get(ArtusInjectEnum.Application);
      configObj = originConfigObj(app);
    }

    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.addFramework(
      item.source || 'app',
      configObj,
      {
        env,
        unitName: item.unitName || ''
      });
  }
}

export default FrameworkLoader;
