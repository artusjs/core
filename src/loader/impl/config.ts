import * as path from 'path';
import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { ArtusInjectEnum } from '../../constant';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { Application } from '../../types';
import { getConfigMetaFromFilename } from '../utils/config_file_meta';

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
    return this.isConfigDir(opts);
  }

  protected static isConfigDir(opts: LoaderFindOptions): boolean {
    const { configDir, baseDir, root } = opts;
    return path.join(baseDir, configDir) === root;
  }

  async load(item: ManifestItem) {
    const { namespace, env } = getConfigMetaFromFilename(item.filename);
    let configObj = await this.loadConfigFile(item);
    if (namespace) {
      configObj = {
        [namespace]: configObj,
      };
    }
    this.configurationHandler.setConfig(env, configObj);
    return configObj;
  }

  protected async loadConfigFile(item: ManifestItem): Promise<Record<string, any>> {
    const originConfigObj = await compatibleRequire(item.path);
    let configObj = originConfigObj;
    if (typeof originConfigObj === 'function') {
      const app = this.container.get(ArtusInjectEnum.Application);
      configObj = originConfigObj(app);
    }
    return configObj;
  }
}

export default ConfigLoader;
