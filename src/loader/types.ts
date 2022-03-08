import { Container } from '@artusjs/injection';

type LoaderType = 'module'|'file'|string;

interface Manifest {
  rootDir: string;
  units: ManifestUnit[];
}

interface ManifestUnit extends Record<string, any> {
  loader: LoaderType;
  path: string;
  type?: string;
}

interface LoaderConstructor {
  new(container: Container): Loader;
};
interface Loader {
  load(unit: ManifestUnit): Promise<void>;
};

export {
  LoaderType,
  Manifest,
  ManifestUnit,
  LoaderConstructor,
  Loader
};

