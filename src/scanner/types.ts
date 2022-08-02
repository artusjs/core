import { BaseLoader, ManifestItem } from "../loader";
import { FrameworkConfig } from "../framework";
import { PluginConfigItem } from "../plugin/types";

export interface ScannerOptions {
  appName: string;
  extensions: string[];
  needWriteFile: boolean;
  useRelativePath: boolean;
  exclude: string[];
  configDir: string;
  envs?: string[];
  framework?: FrameworkConfig;
  plugin?: Record<string, Partial<PluginConfigItem>>;
  loaderListGenerator: (defaultLoaderList: string[]) => (string | typeof BaseLoader)[];
}

export interface WalkOptions {
  source: string;
  baseDir: string;
  configDir: string;
  extensions: string[];
  exclude: string[];
  itemMap: Map<string, ManifestItem[]>;
  unitName?: string;
}

export interface LoaderOptions {
  root: string,
  baseDir: string,
}
