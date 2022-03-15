import { Manifest } from './loader';

export interface Application {
  load(manifest: Manifest): Promise<Application>;
  run(): Promise<void>;
}

export * from './loader/types';
