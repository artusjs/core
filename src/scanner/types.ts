import { BaseLoader, ManifestItem } from "../loader";
import { FrameworkConfig } from "../framework";
import { PluginConfigItem } from "../plugin/types";
import { Application } from "../types";
import { ScanPolicy } from "../constant";

export interface ScannerOptions {
  appName: string;
  extensions: string[];
  needWriteFile: boolean;
  useRelativePath: boolean;
  exclude: string[];
  configDir: string;
  policy: ScanPolicy;
  envs?: string[];
  framework?: FrameworkConfig;
  plugin?: Record<string, Partial<PluginConfigItem>>;
  loaderListGenerator: (defaultLoaderList: string[]) => (string | typeof BaseLoader)[];
  app?: Application;
}

export interface WalkOptions {
  source: string;
  baseDir: string;
  configDir: string;
  policy: ScanPolicy;
  extensions: string[];
  exclude: string[];
  itemMap: Map<string, ManifestItem[]>;
  unitName?: string;
}

export interface LoaderOptions {
  root: string,
  baseDir: string,
}
