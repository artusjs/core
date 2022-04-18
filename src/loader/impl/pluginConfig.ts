import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import ConfigLoader from './config';

@DefineLoader('plugin-config')
class PluginConfigLoader extends ConfigLoader implements Loader {

  async load(item: ManifestItem) {
    await super.load(item);
  }
}

export default PluginConfigLoader;
