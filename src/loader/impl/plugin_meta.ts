import { Container } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import { loadMetaFile } from '../../utils/load_meta_file';
import { PluginMetadata } from '../../plugin/types';

@DefineLoader('plugin-meta')
class PluginMetaLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const pluginMeta: PluginMetadata = await loadMetaFile<PluginMetadata>(item);
    this.container.set({
      id: `pluginMeta_${pluginMeta.name}`,
      value: pluginMeta
    });
  }
}

export default PluginMetaLoader;
