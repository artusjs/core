import 'reflect-metadata';
import { Container } from '@artus/injection';
import { ArtusInjectEnum } from './constant';
import { ArtusStdError, ExceptionHandler } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Application, ApplicationInitOptions, TriggerType } from './types';
import Trigger from './trigger';
import ConfigurationHandler from './configuration';
import { ArtusLogger, Logger } from './logger';

export class ArtusApplication implements Application {
  public manifest?: Manifest;
  public container: Container;

  protected lifecycleManager: LifecycleManager;
  protected loaderFactory: LoaderFactory;

  constructor(opts?: ApplicationInitOptions) {
    this.container = new Container(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.lifecycleManager = new LifecycleManager(this, this.container);
    this.loaderFactory = LoaderFactory.create(this.container);

    this.addLoaderListener();
    this.loadDefaultClass();

    process.on('SIGINT', () => this.close(true));
    process.on('SIGTERM', () => this.close(true));
  }

  get config(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Config);
  }

  get frameworks(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Frameworks);
  }

  get logger(): Logger {
    return this.container.get(ArtusInjectEnum.Logger);
  }

  get packages(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Packages);
  }

  get trigger(): TriggerType {
    return this.container.get(ArtusInjectEnum.Trigger);
  }

  get exceptionHandler(): ExceptionHandler {
    return this.container.get(ExceptionHandler);
  }

  get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
  }

  loadDefaultClass() {
    // load Artus default clazz
    this.container.set({ id: Container, value: this.container });
    this.container.set({ id: ArtusInjectEnum.Application, value: this });
    this.container.set({ id: ArtusInjectEnum.LifecycleManager, value: this.lifecycleManager });

    this.container.set({ type: ConfigurationHandler });
    this.container.set({ type: ArtusLogger });
    this.container.set({ type: Trigger });
    this.container.set({ type: ExceptionHandler });
  }

  async load(manifest: Manifest, root: string = process.cwd()) {
    // Load user manifest
    this.manifest = manifest;

    await this.loaderFactory.loadManifest(manifest, manifest.relative ? root : undefined);

    await this.lifecycleManager.emitHook('didLoad');

    return this;
  }

  async run() {
    await this.lifecycleManager.emitHook('willReady'); // 通知协议实现层启动服务器
    await this.lifecycleManager.emitHook('didReady');
  }

  registerHook(hookName: string, hookFn: HookFunction) {
    this.lifecycleManager.registerHook(hookName, hookFn);
  }

  async close(exit = false) {
    try {
      await this.lifecycleManager.emitHook('beforeClose');
    } catch (e) {
      throw new Error(e);
    }
    if (exit) {
      process.exit(0);
    }
  }

  throwException(code: string): void {
    this.exceptionHandler.throw(code);
  }

  createException(code: string): ArtusStdError {
    return this.exceptionHandler.create(code);
  }

  protected addLoaderListener() {
    this.loaderFactory
      .addLoaderListener('config', {
        before: () => this.lifecycleManager.emitHook('configWillLoad'),
        after: () => {
          this.container.set({
            id: ArtusInjectEnum.Config,
            value: this.configurationHandler.getAllConfig(),
          });
          this.lifecycleManager.emitHook('configDidLoad');
        },
      })
      .addLoaderListener('framework-config', {
        after: () =>
          this.container.set({
            id: ArtusInjectEnum.Frameworks,
            value: this.configurationHandler.getFrameworkConfig(),
          }),
      })
      .addLoaderListener('package-json', {
        after: () =>
          this.container.set({
            id: ArtusInjectEnum.Packages,
            value: this.configurationHandler.getPackages(),
          }),
      });
  }
}
