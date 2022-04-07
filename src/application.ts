import path from 'path';
import { Container } from '@artus/injection';
import { ArtusInjectEnum } from './constraints';
import { ArtusStdError, ExceptionHandler, initException } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
// import { Trigger } from './trigger';
import { Application, ApplicationInitOptions } from './types';

export class ArtusApplication extends Container implements Application {
  public manifest?: Manifest;
  public config?: Record<string, any>;
  private opts: ApplicationInitOptions;
  private lifecycleManager: LifecycleManager;
  private loaderFactory: LoaderFactory;
  private defaultClazzLoaded: boolean = false;

  constructor(opts?: ApplicationInitOptions) {
    super(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.loaderFactory = LoaderFactory.create(this);
    this.lifecycleManager = new LifecycleManager(this);
    this.opts = opts ?? {};

    // Default Hook Register
    this.registerHook('didLoad', initException);

    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
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
    if (this.opts.initClassList) {
      for (const clazz of this.opts.initClassList) {
        this.set({ type: clazz });
      }
    }

    if (this.opts.hookClass) {
      this.set({ type: this.opts.hookClass });
    }

    // SEEME: 后续插件声明也需要执行下述注册流程
    if (this.opts.hookClass) {
      this.lifecycleManager.batchRegisterHookByClass(this.opts.hookClass);
    }
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
