import { Plugin, PluginConfigItem, PluginMetadata } from "./types";
type PluginsMap = Map<string, BasePlugin[]>;

export class BasePlugin implements Plugin {
  public name: string;
  public enable: boolean;
  public importPath: string;
  public metadata: Partial<PluginMetadata> = {};
  public metaFilePath: string = '';

  constructor(name: string, configItem: PluginConfigItem) {
    this.name = name;

    this.importPath = BasePlugin.checkGetPluginConfig(name, configItem);
    this.enable = configItem.enable ?? false;
  }

  async init() { }

  static checkGetPluginConfig(name: string, configItem: PluginConfigItem, shouldThrow: boolean = true): string {
    let importPath = configItem.path ?? '';
    if (configItem.package) {
      importPath = require.resolve(configItem.package);
    }
    if (!importPath) {
      if (shouldThrow) {
        throw new Error(`Plugin ${name} need have path or package field`);
      }
      return '';
    }
    return importPath;
  }

  checkDepExisted(pluginsMap: PluginsMap) {
    for (const { name: pluginName, optional } of this.metadata.dependencies ?? []) {
      const instances = pluginsMap.get(pluginName) ?? [];
      if (!instances.length || instances.every(instance => !instance.enable)) {
        if (optional) {
          // TODO: use artus logger instead
          console.warn(`Plugin ${this.name} need have optional dependence: ${pluginName}.`)
        } else {
          throw new Error(`Plugin ${this.name} need have dependence: ${pluginName}.`);
        }
      }
    }
  }

  getDepEdgeList(): [string, string][] {
    return this.metadata.dependencies
      ?.filter(({ optional }) => !optional)
      ?.map(({ name: depPluginName }) => [this.name, depPluginName]) ?? [];
  }
}
