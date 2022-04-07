import path from 'path';
import { Constructable, Container } from '@artus/injection';
import { ArtusInjectEnum } from './constraints';
import { ArtusStdError, ExceptionHandler, initException } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Application, ApplicationInitOptions, ApplicationLifecycle } from './types';
import Trigger from './trigger';

export const appExtMap = new Set<Constructable<ApplicationLifecycle>>();

export class ArtusApplication extends Container implements Application {
  public manifest?: Manifest;
  public config?: Record<string, any>;
  private lifecycleManager: LifecycleManager;
  private loaderFactory: LoaderFactory;
  private defaultClazzLoaded: boolean = false;

  constructor(opts?: ApplicationInitOptions) {
    super(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.loaderFactory = LoaderFactory.create(this);
    this.lifecycleManager = new LifecycleManager(this);

    // Default Hook Register
    this.registerHook('didLoad', initException);
    this.initExtension();

    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  get trigger(): Trigger {
    return this.get(ArtusInjectEnum.Trigger);
  }

  async loadDefaultClass() {
    // load Artus default clazz
    this.set({ id: ArtusInjectEnum.Application, value: this });

    await this.loaderFactory.loadManifest({
      rootDir: __dirname,
      items: [
        {
          loader: 'module',
          path: path.resolve(__dirname, './trigger')
        },
        {
          loader: 'module',
          path: path.resolve(__dirname, './exception/handler')
        }
      ]
    });

    this.defaultClazzLoaded = true;
  }

  async load(manifest: Manifest) {
    if (!this.defaultClazzLoaded) {
      await this.loadDefaultClass();
    }

    // Load user manifest
    this.manifest = manifest;

    await this.lifecycleManager.emitHook('configWillLoad');
    const config = await this.loaderFactory.loadConfig(manifest);
    this.config = config;
    await this.lifecycleManager.emitHook('configDidLoad', config);

    await this.loaderFactory.loadManifest(manifest);
    await this.lifecycleManager.emitHook('didLoad');
    return this;
  }

  async initExtension() {
    for (const appExtClazz of appExtMap) {
      this.lifecycleManager.batchRegisterHookByClass(appExtClazz);
    }
  }

  async run() {
    await this.lifecycleManager.emitHook('willReady'); // 通知协议实现层启动服务器
    await this.lifecycleManager.emitHook('didReady');
  }

  registerHook(hookName: string, hookFn: HookFunction) {
    this.lifecycleManager.registerHook(hookName, hookFn);
  }

  async close() {
    await this.lifecycleManager.emitHook('beforeClose');
  }

  throwException(code: string): void {
    (this.get(ExceptionHandler) as ExceptionHandler).throw(code);
  }

  createException(code: string): ArtusStdError {
    return (this.get(ExceptionHandler) as ExceptionHandler).create(code);
  }
}

export {
  Application
};
