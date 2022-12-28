import { PLUGIN_CONFIG_PATTERN } from '../../constant';
import { getPackagePath } from '../../plugin/common';
import { PluginConfigItem } from '../../plugin/types';
import { isMatch } from '../../utils';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import { getConfigMetaFromFilename } from '../utils/config_file_meta';
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
    const { env } = getConfigMetaFromFilename(item.filename);
    const configObj = await this.loadConfigFile(item);
    for (const pluginName of Object.keys(configObj)) {
      const pluginConfigItem: PluginConfigItem = configObj[pluginName];
      const itemValidateResult = this.validatePluginConfigItem(pluginConfigItem);
      if (!itemValidateResult.isValid) {
        // validate failed for plugin config item
        throw new Error(
          `Plugin config item ${pluginName} is invalid, please check your plugin config file ${item.path}, reason: ${itemValidateResult.message}`,
        );
      }
      if (pluginConfigItem.package) {
        // convert package to path when load plugin config
        if (pluginConfigItem.path) {
          throw new Error(
            `Plugin ${pluginName} config can't have both package and path at ${item.path}`,
          );
        }
        const loaderState = item.loaderState as { baseDir: string };
        pluginConfigItem.path = getPackagePath(pluginConfigItem.package, [loaderState?.baseDir]);
        delete pluginConfigItem.package;
        configObj[pluginName] = pluginConfigItem;
      }
    }
    this.configurationHandler.setConfig(env, {
      plugin: configObj,
    });
    return configObj;
  }

  private validatePluginConfigItem(pluginConfigItem: PluginConfigItem): {
    isValid: boolean;
    message: string;
  } {
    const pluginConfigItemKeyList = Object.keys(pluginConfigItem);
    if (!pluginConfigItemKeyList.includes('enable')) {
      return {
        isValid: false,
        message: 'must have required property \'enable\'',
      };
    }
    const additionalProperties = pluginConfigItemKeyList.filter(key => !['enable', 'path', 'package'].includes(key));
    if (additionalProperties.length) {
      return {
        isValid: false,
        message: `must NOT have additional properties '${additionalProperties.join(',')}'`,
      };
    }
    return {
      isValid: true,
      message: '',
    };
  }
}

export default PluginConfigLoader;
