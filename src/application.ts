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
import { Bootstrap } from './bootstrap';

export class ArtusApplication implements Application {
  public manifest?: Manifest;

  protected container: Container;
  protected lifecycleManager: LifecycleManager;
  protected loaderFactory: LoaderFactory;
  protected defaultClazzLoaded = false;

  constructor(opts?: ApplicationInitOptions) {
    this.container = new Container(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.lifecycleManager = new LifecycleManager(this, this.container);
    this.loaderFactory = LoaderFactory.create(this.container);

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

  // 兜底方法，不建议对外部使用
  getContainer(): Container {
    return this.container;
  }

  async loadDefaultClass() {
    // load Artus default clazz
    this.container.set({ id: ArtusInjectEnum.Application, value: this });
    this.container.set({ id: ArtusInjectEnum.LifecycleManager, value: this.lifecycleManager });

    // SEEME: 暂时使用 set 进行注入，后续考虑更改为 Loader
    this.container.set({ type: ConfigurationHandler });
    this.container.set({ type: ArtusLogger });
    this.container.set({ type: Trigger });
    this.container.set({ type: ExceptionHandler });

    this.defaultClazzLoaded = true;
  }

  async load(manifest: Manifest, root: string = process.cwd()) {
    if (!this.defaultClazzLoaded) {
      await this.loadDefaultClass();
    }

    // Load user manifest
    this.manifest = manifest;

    await this.loaderFactory.loadManifest(manifest, manifest.relative ? root : undefined);

    await this.lifecycleManager.emitHook('didLoad');

    return this;
  }

  async run() {
    await this.lifecycleManager.emitHook('willReady');

    // Notify protocol-implementer that the server can be started
    let bootstrap: Bootstrap;
    try {
      bootstrap = await this.container.getAsync(ArtusInjectEnum.Bootstrap);
    } catch (error) {
      this.logger.warn('Bootstrap is not implemented, server will not start');
    }
    if (bootstrap) {
      await bootstrap.run();
    }

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
}
