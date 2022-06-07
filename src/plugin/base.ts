import { Plugin, PluginConfigItem, PluginMetadata } from "./types";
type PluginMap = Map<string, BasePlugin>;

export class BasePlugin implements Plugin {
  public name: string;
  public enable: boolean;
  public importPath: string;
  public metadata: Partial<PluginMetadata> = {};
  public metaFilePath: string = '';

  constructor(name: string, configItem: PluginConfigItem) {
    this.name = name;
    let importPath = configItem.path ?? '';
    if (configItem.package) {
      const pkgJson = require(`${configItem.package}/package.json`);
      if(pkgJson && pkgJson.pluginPath){
        importPath = pkgJson.pluginPath;
      } else {
        importPath = require.resolve(configItem.package);
      }
    }
    if (!importPath) {
      throw new Error(`Plugin ${name} need have path or package field`);
    }
    this.importPath = importPath;
    this.enable = configItem.enable ?? false;
  }

  async init() { }

  checkDepExisted(pluginMap: PluginMap) {
    for (const { name: pluginName, optional } of this.metadata.dependencies ?? []) {
      const instance = pluginMap.get(pluginName);
      if (!instance || !instance.enable) {
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
