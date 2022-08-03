import { Plugin, PluginConfigItem, PluginMetadata } from "./types";
import path from 'path';
type PluginMap = Map<string, BasePlugin>;

export class BasePlugin implements Plugin {
  static getPath(packageName: string, paths?: string[]): string {
    const opts = paths ? { paths } : undefined;
    return path.resolve(require.resolve(packageName, opts), '..');
  }

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
        importPath = BasePlugin.getPath(configItem.package);
      }
      if (!importPath) {
        throw new Error(`Plugin ${name} need have path or package field`);
      }
      this.importPath = importPath;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init() { }

  checkDepExisted(pluginMap: PluginMap) {
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

  getDepEdgeList(): [string, string][] {
    return this.metadata.dependencies
      ?.filter(({ optional }) => !optional)
      ?.map(({ name: depPluginName }) => [this.name, depPluginName]) ?? [];
  }
}
