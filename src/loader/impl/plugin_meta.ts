import { Container } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import { loadMetaFile } from '../../utils/load_meta_file';
import { PluginMetadata } from '../../plugin/types';
import { PLUGIN_META_FILENAME } from '../../constant';
import { isMatch } from '../../utils';

@DefineLoader('plugin-meta')
class PluginMetaLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  static async is(opts: LoaderFindOptions): Promise<boolean> {
    return isMatch(opts.filename, PLUGIN_META_FILENAME);
  }

  async load(item: ManifestItem) {
    const pluginMeta: PluginMetadata = await loadMetaFile<PluginMetadata>(item.path);
    this.container.set({
      id: `pluginMeta_${pluginMeta.name}`,
      value: pluginMeta,
    });
  }
}

export default PluginMetaLoader;
