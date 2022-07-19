import { PLUGIN_CONFIG_PATTERN } from '../../constant';
import { ArtusPlugin } from '../../plugin';
import { PluginConfigItem } from '../../plugin/types';
import { isMatch } from '../../utils';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import ConfigLoader from './config';

@DefineLoader('plugin-config')
class PluginConfigLoader extends ConfigLoader implements Loader {
  static async is(opts: LoaderFindOptions): Promise<boolean> {
    if (this.isConfigDir(opts)) {
      return isMatch(opts.filename, PLUGIN_CONFIG_PATTERN);
    }
    return false;
  }

  async load(item: ManifestItem) {
    const { env } = await this.getConfigFileMeta(item);
    const configObj = await this.loadConfigFile(item);
    for (const pluginName of Object.keys(configObj)) {
      const pluginConfigItem: PluginConfigItem = configObj[pluginName];
      if (pluginConfigItem.package) {
        // convert package to path when load plugin config
        if (pluginConfigItem.path) {
          throw new Error(
            `Plugin ${pluginName} config can't have both package and path at ${item.path}`,
          );
        }
        if (pluginConfigItem.enable) {
          pluginConfigItem.path = ArtusPlugin.getPath(pluginConfigItem.package);
        }
        delete pluginConfigItem.package;
        configObj[pluginName] = pluginConfigItem;
      }
    }
    this.configurationHandler.setConfig(env, {
      plugin: configObj,
    });
    return configObj;
  }
}

export default PluginConfigLoader;
