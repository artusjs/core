import path from 'path';
import { loadMetaFile } from '../utils/load_meta_file';
import { exisis } from '../utils/fs';
import { PLUGIN_META_FILENAME } from '../constant';
import { PluginConfigItem, PluginMap, PluginMetadata, PluginType } from './types';
import { getPackagePath } from './common';

export class Plugin implements PluginType {
  public name: string;
  public enable: boolean;
  public importPath = '';
  public metadata: Partial<PluginMetadata> = {};
  public metaFilePath = '';

  constructor(name: string, configItem: PluginConfigItem) {
    this.name = name;
    this.enable = configItem.enable ?? false;
    if (this.enable) {
      let importPath = configItem.path ?? '';
      if (configItem.package) {
        if (importPath) {
          throw new Error(`plugin ${name} config error, package and path can't be set at the same time.`);
        }
        importPath = getPackagePath(configItem.package);
      }
      if (!importPath) {
        throw new Error(`Plugin ${name} need have path or package field`);
      }
      this.importPath = importPath;
    }
  }

  async init() {
    if (!this.enable) {
      return;
    }
    await this.checkAndLoadMetadata();
    if (!this.metadata) {
      throw new Error(`${this.name} is not have metadata.`);
    }
    if (this.metadata.name !== this.name) {
      throw new Error(`${this.name} metadata invalid, name is ${this.metadata.name}`);
    }
  }

  public checkDepExisted(pluginMap: PluginMap) {
    for (const { name: pluginName, optional } of this.metadata.dependencies ?? []) {
      const instance = pluginMap.get(pluginName);
      if (!instance || !instance.enable) {
        if (optional) {
          // TODO: use artus logger instead
          console.warn(`Plugin ${this.name} need have optional dependence: ${pluginName}.`);
        } else {
          throw new Error(`Plugin ${this.name} need have dependence: ${pluginName}.`);
        }
      }
    }
  }

  public getDepEdgeList(): [string, string][] {
    return this.metadata.dependencies
      ?.filter(({ optional }) => !optional)
      ?.map(({ name: depPluginName }) => [this.name, depPluginName]) ?? [];
  }

  private async checkAndLoadMetadata() {
    // check import path
    if (!await exisis(this.importPath)) {
      throw new Error(`load plugin <${this.name}> import path ${this.importPath} is not exists.`);
    }
    const metaFilePath = path.resolve(this.importPath, PLUGIN_META_FILENAME);
    try {
      if (!await exisis(metaFilePath)) {
        throw new Error(`load plugin <${this.name}> import path ${this.importPath} can't find meta file.`);
      }
      this.metadata = await loadMetaFile(metaFilePath);
      this.metaFilePath = metaFilePath;
    } catch (e) {
      throw new Error(`load plugin <${this.name}> failed, err: ${e}`);
    }
  }
}
