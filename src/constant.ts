export const DEFAULT_LOADER = 'module';
export const LOADER_NAME_META = 'loader:name';

export const ArtusInjectPrefix = 'artus#';

export enum ArtusInjectEnum {
  Application = 'artus#application',
  Config = 'artus#config',
  DefaultContainerName = 'artus#default_container',
  Frameworks = 'artus#framework-config',
  LifecycleManager = 'artus#lifecycle-manager',
  Logger = 'artus#logger',
  Packages = 'artus#packages',
  Trigger = 'artus#trigger',
}

export const ARTUS_EXCEPTION_DEFAULT_LOCALE = 'en';

export const ARTUS_SERVER_ENV = 'ARTUS_SERVER_ENV';

export enum ARTUS_DEFAULT_CONFIG_ENV {
  DEV = 'development',
  PROD = 'production',
  DEFAULT = 'default',
}

export const HOOK_NAME_META_PREFIX = 'hookName:';
export const CONSTRUCTOR_PARAMS = 'constructor:params';
export const CONSTRUCTOR_PARAMS_APP = 'constructor:params:app';
export const CONSTRUCTOR_PARAMS_CONTAINER = 'constructor:params:container';
export const CONSTRUCTOR_PARAMS_CONTEXT = 'constructor:params:context';
export const HOOK_FILE_LOADER = 'appHook:fileLoader';
export const HOOK_CONFIG_HANDLE = 'appHook:configHandle::';

export const DEFAULT_EXCLUDES = [
  'test/',
  'node_modules',
  '.*',
  'tsconfig*.json',
  '*.d.ts',
  'jest.config.*',
  'meta.*',
  'LICENSE',
  'pnpm-lock.yaml',
];

export const FRAMEWORK_PATTERN = 'framework.*';
export const PLUGIN_CONFIG_PATTERN = 'plugin.*';
export const CONFIG_PATTERN = 'config.*';
export const PACKAGE_JSON = 'package.json';
export const PLUGIN_META_FILENAME = 'meta.json';
export const EXCEPTION_FILENAME = 'exception.json';

export const DEFAULT_LOADER_LIST_WITH_ORDER = [
  'exception',
  'plugin-config',
  'lifecycle-hook-unit',
  'config',
  'plugin-meta',
  'module',
  'framework-config',
  'package-json',
];

export const DEFAULT_CONFIG_DIR = 'src/config';

export const SHOULD_OVERWRITE_VALUE = 'shouldOverwrite';
