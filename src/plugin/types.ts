import { ManifestPluginUnit } from "../loader";

export const enum PluginType {
  simple = 'simple',
  module = 'module',
}

export interface PluginMetadata {
  name: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  type?: PluginType;
}

export interface PluginConfigItem {
  enable: boolean;
  path?: string;
  package?: string;
  manifest?: Partial<ManifestPluginUnit>;
}

export interface Plugin {
  name: string;
  enable: boolean;
  importPath: string;
  metadata: Partial<PluginMetadata>;
  manifest: Partial<ManifestPluginUnit>;

  init(): Promise<void>;
  checkDepExisted(map: Map<string, Plugin>): void;
  getDepEdgeList(): [string, string][];
}
