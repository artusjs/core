import { Container } from '@artus/injection';
import { ScanPolicy } from '../constant';
import { PluginConfig, PluginMetadata } from '../plugin/types';

// Key: Env => PluginName => Value: PluginConfigItem
export type PluginConfigEnvMap = Record<string, PluginConfig>;

export interface RefMapItem {
  relativedPath?: string;
  packageVersion?: string;
  pluginMetadata?: PluginMetadata;
  items: ManifestItem[];
}
// Key: RefName => RefMapItem
export type RefMap = Record<string, RefMapItem>;

export interface Manifest {
  version: '2';
  pluginConfig: PluginConfigEnvMap;
  refMap: RefMap;
}

export interface ManifestItem<LoaderState = unknown> extends Record<string, any> {
  path: string;
  extname: string;
  filename: string;
  loader?: string;
  source?: string;
  unitName?: string;
  loaderState?: LoaderState;
}

export interface LoaderFindOptions {
  filename: string;
  root: string;
  baseDir: string;
  configDir: string;
  policy?: ScanPolicy;
}

export interface LoaderFindResult {
  loaderName: string;
  loaderState?: unknown;
}

export interface LoaderHookUnit {
  before?: Function;
  after?: Function;
}

export interface LoaderConstructor {
  new(container: Container): Loader;
  is?(opts: LoaderFindOptions): Promise<boolean>;
  onFind?(opts: LoaderFindOptions): Promise<any>;
}
export interface Loader {
  state?: any;
  load(item: ManifestItem): Promise<any>;
}

