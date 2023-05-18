export const DEFAULT_LOADER = 'module';
export const LOADER_NAME_META = 'loader:name';

export const ArtusInjectPrefix = 'artus#';

export enum ArtusInjectEnum {
  Application = 'artus#application',
  Config = 'artus#config',
  DefaultContainerName = 'artus#default_container',
  EnvList = 'artus#env_list',
}

export enum ARTUS_DEFAULT_CONFIG_ENV {
  DEV = 'development',
  PROD = 'production',
  DEFAULT = 'default',
}

export enum ScanPolicy {
  NamedExport = 'named_export',
  DefaultExport = 'default_export',
  All = 'all',
}

export const ARTUS_EXCEPTION_DEFAULT_LOCALE = 'en';

export const ARTUS_SERVER_ENV = 'ARTUS_SERVER_ENV';

export const HOOK_NAME_META_PREFIX = 'hookName:';
export const HOOK_FILE_LOADER = 'appHook:fileLoader';

export const DEFAULT_EXCLUDES = [
  'test',
  'node_modules',
  '.*',
  'tsconfig*.json',
  '*.d.ts',
  'jest.config.*',
  'meta.json',
  'LICENSE',
  'pnpm-lock.yaml',
];
export const DEFAULT_MODULE_EXTENSIONS = ['.js', '.json', '.node'];
export const DEFAULT_APP_REF = '_app';

export const FRAMEWORK_PATTERN = 'framework.*';
export const PLUGIN_CONFIG_PATTERN = 'plugin.*';
export const PACKAGE_JSON = 'package.json';
export const PLUGIN_META_FILENAME = 'meta.json';
export const EXCEPTION_FILENAME = 'exception.json';

export const DEFAULT_LOADER_LIST_WITH_ORDER = [
  'exception',
  'exception-filter',
  'plugin-meta',
  'framework-config',
  'package-json',
  'module',
  'lifecycle-hook-unit',
  'config',
];

export const DEFAULT_CONFIG_DIR = 'src/config';
export const DEFAULT_MANIFEST_FILENAME = 'manifest.json';

export const SHOULD_OVERWRITE_VALUE = 'shouldOverwrite';
