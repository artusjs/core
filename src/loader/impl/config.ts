import * as path from 'path';
import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV, CONFIG_PATTERN } from '../../constant';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderCheckOptions } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { isMatch } from '../../utils';

@DefineLoader('config')
class ConfigLoader implements Loader {
  protected container: Container;

  constructor(container) {
    this.container = container;
  }

  static async is(opts: LoaderCheckOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, CONFIG_PATTERN);
    }
    return false;
  }

  protected static isConfigDir(opts: LoaderCheckOptions): boolean {
      const { configDir, baseDir, root } = opts;
      return path.join(baseDir, configDir) === root;
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
