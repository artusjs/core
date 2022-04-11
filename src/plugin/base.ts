import { Plugin, PluginConfigItem, PluginMetadata } from "./types";

export class BasePlugin implements Plugin {
  public name: string;
  public enable: boolean;
  public importPath: string;
  public metadata: Partial<PluginMetadata> = {};

  constructor(name: string, configItem: PluginConfigItem) {
    this.name = name;
    const importPath = configItem.path ?? configItem.package;
    if (!importPath) {
      throw new Error(`Plugin ${name} need have path or package field`);
    }
    this.importPath = importPath;
    this.enable = configItem.enable ?? false;
  }

  async init() {}

  checkDepExisted(map: Map<string, BasePlugin>): void {
    const depPluginNames = [
      ...(this.metadata.dependencies ?? []),
      ...(this.metadata.optionalDependencies ?? []),
    ];
    for (const pluginName of depPluginNames) {
      if (!map.has(pluginName)) {
        throw new Error(`Plugin ${this.name} need have plugin ${pluginName} dependencies.`);
      }
    }
  }

  getDepEdgeList(): [string, string][] {
    return this.metadata.dependencies?.map((depPluginName) => [this.name, depPluginName]) ?? [];
  }
}
