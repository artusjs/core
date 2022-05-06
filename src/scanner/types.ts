export interface ScannerOptions {
  appName: string;
  extensions: string[];
  needWriteFile: boolean;
  excluded?: string[];
  configDir: string
  envs?: string[];
}

export interface WalkOptions {
  source: string,
  baseDir: string,
  unitName?: string,
}

export interface LoaderOptions {
  root: string,
  baseDir: string,
}
