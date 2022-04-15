import { Container } from '@artus/injection';

interface Manifest {
  app: Partial<ManifestAppUnit>;
  plugins?: Record<string, Partial<ManifestPluginUnit>>;
}

interface ManifestUnit {
  items: ManifestItem[];
  extension: ManifestItem[];
  exception: ManifestItem[];
  config: ManifestItem[];
  packageJson: ManifestItem;
}

interface ManifestAppUnit extends ManifestUnit {
  pluginConfig: ManifestItem[];
}

interface ManifestPluginUnit extends ManifestUnit {
  pluginMeta: ManifestItem;
}

interface ManifestItem extends Record<string, any> {
  path: string;
  extname: string;
  filename: string;
  loader?: string;
}

interface LoaderConstructor {
  new(container: Container): Loader;
};
interface Loader {
  load(item: ManifestItem): Promise<void>;
};

export {
  Manifest,
  ManifestAppUnit,
  ManifestPluginUnit,
  ManifestItem,
  LoaderConstructor,
  Loader,
};

