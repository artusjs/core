import 'reflect-metadata';
import { Container } from '@artus/injection';
import { ArtusInjectEnum } from './constraints';
import { ArtusStdError, ExceptionHandler } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Application, ApplicationInitOptions } from './types';
import Trigger from './trigger';
import ConfigurationHandler from './configuration';

export class ArtusApplication implements Application {
  public manifest?: Manifest;

  protected container: Container;
  protected lifecycleManager: LifecycleManager;
  protected loaderFactory: LoaderFactory;
  protected defaultClazzLoaded: boolean = false;

  constructor(opts?: ApplicationInitOptions) {
    this.container = new Container(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.lifecycleManager = new LifecycleManager(this, this.container);
    this.loaderFactory = LoaderFactory.create(this.container, opts?.envUnits);

    process.on('SIGINT', () => this.close(true));
    process.on('SIGTERM', () => this.close(true));
  }

  get config(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Config);
  }

  get frameworks(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Frameworks);
  }

  get packages(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Packages);
  }

  get trigger(): Trigger {
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
    this.container.set({ type: Trigger });
    this.container.set({ type: ExceptionHandler });

    this.defaultClazzLoaded = true;
  }

  async load(manifest: Manifest) {
    if (!this.defaultClazzLoaded) {
      await this.loadDefaultClass();
    }

    // Load user manifest
    this.manifest = manifest;

    // load env units
    await this.loaderFactory.loadEnvUnits(manifest);

    // load other files
    await this.loaderFactory.loadManifest(manifest);

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

  async close(exit: boolean = false) {
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

export {
  Application
};
