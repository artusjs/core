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

export {
  LoaderType,
  Manifest,
  ManifestUnit
};

