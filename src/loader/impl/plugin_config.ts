import { PLUGIN_CONFIG_PATTERN } from '../../constraints';
import { isMatch } from '../../utils';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderCheckOptions } from '../types';
import ConfigLoader from './config';

@DefineLoader('plugin-config')
class PluginConfigLoader extends ConfigLoader implements Loader {

  async is(opts: LoaderCheckOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, PLUGIN_CONFIG_PATTERN);
    }
    return false;
  }

  async load(item: ManifestItem) {
    await super.load(item);
  }
}

export default PluginConfigLoader;
