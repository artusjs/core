import { LoggerType } from '../logger';

export interface PluginCreateOptions {
  logger?: LoggerType;
}

export interface PluginMetadata {
  name: string;
  dependencies?: PluginDependencyItem[];
  type?: 'simple' | 'module' | string;
  configDir?: string
  exclude?: string[];
}

export interface PluginDependencyItem {
  name: string;
  optional?: boolean;

  // Only exist on runtime, cannot config in meta.json
  _enabled?: boolean;
}

export interface PluginConfigItem {
  enable?: boolean;
  path?: string;
  package?: string;
  refName?: string;
  metadata?: PluginMetadata;
}

export type PluginConfig = Record<string, PluginConfigItem>;
export type PluginMap = Map<string, PluginType>;

export interface PluginType {
  name: string;
  enable: boolean;
  importPath: string;
  metadata: Partial<PluginMetadata>;
  metaFilePath: string;

  init(): Promise<void>;
  checkDepExisted(map: PluginMap): void;
  getDepEdgeList(): [string, string][];
}
