import { Container } from '@artus/injection';

interface Manifest {
  items: ManifestItem[];
  relative?: boolean;
}

interface ManifestItem extends Record<string, any> {
  path: string;
  extname: string;
  filename: string;
  loader?: string;
  source?: string;
  unitName?: string
}

interface LoaderCheckOptions {
  filename: string;
  root: string;
  baseDir: string;
  configDir: string;
}

interface LoaderHookUnit {
  before?: Function,
  after?: Function,
};

interface LoaderConstructor {
  new(container: Container): Loader;
  is?(opts: LoaderCheckOptions): Promise<boolean>;
};
interface Loader {
  load(item: ManifestItem): Promise<void>;
};

export {
  Manifest,
  ManifestItem,
  LoaderHookUnit,
  LoaderConstructor,
  LoaderCheckOptions,
  Loader,
};

