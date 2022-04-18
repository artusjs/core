import { Container } from '@artus/injection';

type LoaderType = 'module' | 'file' | string;

interface Manifest {
  rootDir: string;
  items: ManifestItem[];
}

interface ManifestItem extends Record<string, any> {
  loader: LoaderType;
  path: string;
  type?: string;
}

interface LoaderConstructor {
  new(container: Container): Loader;
};
interface Loader {
  load(item: ManifestItem): Promise<void>;
};

export {
  LoaderType,
  Manifest,
  ManifestItem,
  LoaderConstructor,
  Loader,
};

