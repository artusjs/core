import { ManifestEnvMap, ManifestV2, ManifestV2PluginConfig, ManifestV2RefMapItem } from '../loader';
import { PluginConfigMap } from '../plugin/types';
import { Application } from '../types';
import { ScanPolicy } from '../constant';


export interface ScannerOptions {
  extensions: string[];
  needWriteFile: boolean;
  useRelativePath: boolean;
  exclude: string[];
  configDir: string;
  policy: ScanPolicy;
  envs?: string[];
  plugin?: PluginConfigMap;
  app?: Application;
}

export interface WalkOptions {
  baseDir: string;
  configDir: string;
  policy: ScanPolicy;
  extensions: string[];
  exclude: string[];
  source?: string;
  unitName?: string;
}

export interface LoaderOptions {
  root: string;
  baseDir: string;
}

export interface ScannerConstructor {
  new(opts?: Partial<ScannerOptions>): ScannerType;
}

export interface ScannerType {
  scan(root: string): Promise<ManifestEnvMap | ManifestV2>;
}

export interface ScanTaskItem {
  curPath: string;
  refName: string;
}

export interface ScanContext {
  root: string;
  taskQueue: ScanTaskItem[];
  pluginConfigMap: ManifestV2PluginConfig;
  refMap: Record<string, ManifestV2RefMapItem>;
  options: ScannerOptions;
  app: Application;
}

