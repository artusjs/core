import ConfigurationHandler from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderCheckOptions } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV, FRAMEWORK_PATTERN } from '../../constraints';
import ConfigLoader from './config';
import { isMatch } from '../../utils';

@DefineLoader('framework-config')
class FrameworkConfigLoader extends ConfigLoader implements Loader {
  constructor(container) {
    super(container);
  }

  async is(opts: LoaderCheckOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, FRAMEWORK_PATTERN);
    }
    return false;
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
    configHandler.addFramework(item.source || 'app', configObj, {
      env,
      unitName: item.unitName || '',
    });
  }
}

export default FrameworkConfigLoader;
