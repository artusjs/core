import * as path from 'path';
import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV, CONFIG_PATTERN } from '../../constant';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { isMatch } from '../../utils';
import { Application } from '../../types';

export interface ConfigFileMeta {
  env: string;
  namespace?: string;
}

@DefineLoader('config')
class ConfigLoader implements Loader {
  protected container: Container;

  constructor(container) {
    this.container = container;
  }

  protected get app(): Application {
    return this.container.get(ArtusInjectEnum.Application);
  }

  protected get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
  }

  static async is(opts: LoaderFindOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, CONFIG_PATTERN);
    }
    return false;
  }

  protected static isConfigDir(opts: LoaderFindOptions): boolean {
      const { configDir, baseDir, root } = opts;
      return path.join(baseDir, configDir) === root;
  }

  async load(item: ManifestItem) {
    const { namespace, env } = await this.getConfigFileMeta(item);
    let configObj = await this.loadConfigFile(item);
    if (namespace) {
      configObj = {
        [namespace]: configObj
      };
    }
    this.configurationHandler.setConfig(env, configObj);
  }

  protected async getConfigFileMeta(item: ManifestItem): Promise<ConfigFileMeta> {
    let [namespace, env, extname] = item.filename.split('.');
    if (!extname) {
      // No env flag, set to Default
      env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    const meta: ConfigFileMeta = {
      env
    };
    if (namespace !== 'config') {
      meta.namespace = namespace;
    }
    return meta
  }

  protected async loadConfigFile(item: ManifestItem): Promise<Record<string, any>> {
    const originConfigObj = await compatibleRequire(item.path);
    let configObj = originConfigObj;
    if(typeof originConfigObj === 'function') {
      const app = this.container.get(ArtusInjectEnum.Application);
      configObj = originConfigObj(app);
    }
    return configObj;
  }
}

export default ConfigLoader;
