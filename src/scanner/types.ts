import { Manifest } from '../loader';
import { PluginConfig } from '../plugin/types';
import { Application } from '../types';
import { ScanPolicy } from '../constant';


export interface ScannerOptions {
  extensions: string[];
  needWriteFile: boolean;
  manifestFilePath?: string;
  useRelativePath: boolean;
  exclude: string[];
  configDir: string;
  policy: ScanPolicy;
  envs?: string[];
  plugin?: PluginConfig;
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
  scan(root: string): Promise<Manifest>;
}

export interface ScanTaskItem {
  curPath: string;
  refName: string;
  isPackage: boolean;
}

