import { Container } from '@artus/injection';

interface Manifest {
  items: ManifestItem[];
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
};
interface Loader {
  is?(opts: LoaderCheckOptions): Promise<boolean>;
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

