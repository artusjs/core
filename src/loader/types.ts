import { Container } from '@artus/injection';
import { ScanPolicy } from '../constant';
import { PluginConfigItem, PluginDependencyItem } from '../plugin/types';

export interface Manifest {
  items: ManifestItem[];
  pluginConfig?: Record<string, PluginConfigItem>;
  relative?: boolean;
}
export type ManifestEnvMap = Record<string, Manifest>;

export interface ManifestV2PluginConfigItem {
  enable: boolean;
  refName: string;
}
export type ManifestV2PluginConfig = Record<string, ManifestV2PluginConfigItem>;
export interface ManifestV2RefMapItem {
  packageVersion?: string;
  dependencies?: PluginDependencyItem[];
  items: ManifestItem[];
}

export interface ManifestV2 {
  version: '2';
  pluginConfig: Record<string, Record<string, ManifestV2PluginConfigItem>>;
  refMap: Record<string, ManifestV2RefMapItem>;
  relative: boolean;
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

