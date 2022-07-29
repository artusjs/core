import { FrameworkObject } from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import { FRAMEWORK_PATTERN } from '../../constant';
import ConfigLoader from './config';
import { isMatch } from '../../utils';
import { getConfigMetaFromFilename } from '../utils/config_file_meta';

@DefineLoader('framework-config')
class FrameworkConfigLoader extends ConfigLoader implements Loader {
  static async is(opts: LoaderFindOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, FRAMEWORK_PATTERN);
    }
    return false;
  }

  async load(item: ManifestItem) {
    const { env } = getConfigMetaFromFilename(item.filename);
    const configObj = (await this.loadConfigFile(item)) as FrameworkObject;
    this.configurationHandler.addFramework(item.source || 'app', configObj, {
      env,
      unitName: item.unitName || '',
    });
    return configObj;
  }
}

export default FrameworkConfigLoader;
