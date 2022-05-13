import { BaseLoader } from "../loader";

export interface ScannerOptions {
  appName: string;
  extensions: string[];
  needWriteFile: boolean;
  excluded?: string[];
  configDir: string;
  envs?: string[];
  loaderListGenerator: (defaultLoaderList: string[]) => (string|typeof BaseLoader)[];
}

export interface WalkOptions {
  source: string,
  baseDir: string,
  configDir: string,
  unitName?: string,
}

export interface LoaderOptions {
  root: string,
  baseDir: string,
}
