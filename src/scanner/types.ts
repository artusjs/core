import { ManifestEnvMap, ManifestV2, ManifestV2PluginConfig, ManifestV2RefMapItem } from '../loader';
import { PluginConfigItem } from '../plugin/types';
import { Application } from '../types';
import { ScanPolicy } from '../constant';

export interface ScannerOptions {
  appName: string;
  extensions: string[];
  needWriteFile: boolean;
  useRelativePath: boolean;
  exclude: string[];
  configDir: string;
  policy: ScanPolicy;
  envs?: string[];
  plugin?: Record<string, Partial<PluginConfigItem>>;
  app?: Application;
}

export interface WalkOptions {
  baseDir: string;
  configDir: string;
  policy: ScanPolicy;
  extensions: string[];
  exclude: string[];
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
  root: string;
  subPath: string;
  refName: string;
}

export interface ScanContext {
  taskQueue: ScanTaskItem[];
  pluginConfigMap: ManifestV2PluginConfig;
  refMap: Record<string, ManifestV2RefMapItem>;
  options: ScannerOptions;
}

