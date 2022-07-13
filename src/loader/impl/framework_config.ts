import { FrameworkObject } from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import { FRAMEWORK_PATTERN } from '../../constant';
import ConfigLoader from './config';
import { isMatch } from '../../utils';

@DefineLoader('framework-config')
class FrameworkConfigLoader extends ConfigLoader implements Loader {
  static async is(opts: LoaderFindOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, FRAMEWORK_PATTERN);
    }
    return false;
  }

  async load(item: ManifestItem) {
    const { env } = await this.getConfigFileMeta(item);
    const configObj = await this.loadConfigFile(item) as FrameworkObject;
    this.configurationHandler.addFramework(item.source || 'app', configObj, {
      env,
      unitName: item.unitName || '',
    });
  }
}

export default FrameworkConfigLoader;
