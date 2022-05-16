export const enum PluginType {
  simple = 'simple',
  module = 'module',
}

export interface PluginMetadata {
  name: string;
  dependencies?: PluginDependencyItem[];
  type?: PluginType;
  configDir?: string
}

export interface PluginDependencyItem {
  name: string;
  optional?: boolean;
}

export interface PluginConfigItem {
  enable: boolean;
  path?: string;
  package?: string;
}

export interface Plugin {
  name: string;
  enable: boolean;
  importPath: string;
  metadata: Partial<PluginMetadata>;
  metaFilePath: string;

  init(): Promise<void>;
  checkDepExisted(map: Map<string, Plugin>): void;
  getDepEdgeList(): [string, string][];
}
