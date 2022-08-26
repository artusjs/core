import { Container } from '@artus/injection';
import { ScanPolicy } from '../constant';

interface Manifest {
  items: ManifestItem[];
  relative?: boolean;
}

interface ManifestItem<LoaderState = unknown> extends Record<string, any> {
  path: string;
  extname: string;
  filename: string;
  loader?: string;
  source?: string;
  unitName?: string;
  loaderState?: LoaderState;
}

interface LoaderFindOptions {
  filename: string;
  root: string;
  baseDir: string;
  configDir: string;
  policy?: ScanPolicy;
}

interface LoaderFindResult {
  loaderName: string;
  loaderState?: unknown;
}

interface LoaderHookUnit {
  before?: Function;
  after?: Function;
}

interface LoaderConstructor {
  new (container: Container): Loader;
  is?(opts: LoaderFindOptions): Promise<boolean>;
  onFind?(opts: LoaderFindOptions): Promise<any>;
}
interface Loader {
  state?: any;
  load(item: ManifestItem): Promise<any>;
}

export {
  Manifest,
  ManifestItem,
  LoaderHookUnit,
  LoaderConstructor,
  Loader,
  LoaderFindOptions,
  LoaderFindResult,
};
