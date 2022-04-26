export const DEFAULT_LOADER = 'module';

export const enum ArtusInjectEnum {
  Application = 'artus#application',
  Trigger = 'artus#trigger',
  LifecycleManager = 'artus#lifecycle-manager',
  Config = 'artus#config',
  Frameworks = 'artus#frameworks',
  Packages = 'artus#packages',
  DefaultContainerName = 'artus#default_container',
}

export const ARTUS_EXCEPTION_DEFAULT_LOCALE = 'en';

export const ARTUS_SERVER_ENV = 'ARTUS_SERVER_ENV';

export enum ARTUS_DEFAULT_CONFIG_ENV {
  DEV = 'development',
  PROD = 'production',
  DEFAULT = 'default',
};

export const HOOK_NAME_META_PREFIX = 'hookName:';
export const HOOK_CONSTRUCTOR_PARAMS = 'appHook:constructorParams';
export const HOOK_CONSTRUCTOR_PARAMS_APP = 'appHook:constructorParams:app';
export const HOOK_CONSTRUCTOR_PARAMS_CONTAINER = 'appHook:constructorParams:container';
export const HOOK_PARAMS_CONTEXT = 'appHook:constructorParams:context';
export const HOOK_FILE_LOADER = 'appHook:fileLoader';

export const DEFAULT_EXCLUDES = [
  'test',
  'node_modules',
  '.*',
  'tsconfig*.json',
  '*.d.ts',
  'jest.config.*',
  'meta.*',
  'LICENSE'
];

export const FRAMEWORK_PATTERN = 'framework.*';
export const PLUGIN_CONFIG_PATTERN = 'plugin.*';
export const CONFIG_PATTERN = 'config.*';
export const PLUGIN_META = ['meta.json', 'meta.yaml', 'meta.yml'];
export const PACKAGE_JSON = 'package.json';
export const EXCEPTION_FILE = 'artus-exception.yaml';

export const DEFAULT_LOADER_LIST_WITH_ORDER = [
  'exception',
  'plugin-config',
  'extension',
  'config',
  'plugin-meta',
  'module',
  'framework-config',
  'package-json',
];

export const DEFAULT_CONFIG_DIR = 'src/config';
