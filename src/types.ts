export interface Application {
  load();
  run(): Promise<void>;
}

export * from './loader/types';
