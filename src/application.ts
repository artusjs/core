import { Container } from '@artus/injection';
import { ARTUS_DEFAULT_CONTAINER, ARTUS_TRIGGER_ID } from './constraints';
import { ArtusStdError, ExceptionHandler, initException } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Trigger } from './trigger';
import { Application, ApplicationInitOptions } from './types';

export const ARTUS_APPLICATION_SYMBOL = 'ArtusApplication';

export class ArtusApplication extends Container implements Application {
  public manifest?: Manifest;
  public config?: Record<string, any>;
  private lifecycleManager: LifecycleManager;

  constructor(opts?: ApplicationInitOptions) {
    super(opts?.containerName ?? ARTUS_DEFAULT_CONTAINER);

    this.set({ id: ARTUS_APPLICATION_SYMBOL, value: this });
    this.set({ id: ARTUS_TRIGGER_ID, type: opts?.trigger ?? Trigger });
    this.set({ type: ExceptionHandler });
    this.set({ type: ArtusApplication });

    if (opts?.initClassList) {
      for (const clazz of opts.initClassList) {
        this.set({ type: clazz });
      }
    }

    if (opts?.hookClass) {
      this.set({ type: opts?.hookClass });
    }

    this.lifecycleManager = new LifecycleManager(this);

    // Hook Register
    this.registerHook('didLoad', initException);

    // SEEME: 后续插件声明也需要执行下述注册流程
    if (opts?.hookClass) {
      this.lifecycleManager.batchRegisterHookByClass(opts.hookClass);
    }

    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }


  async load(manifest: Manifest) {
    this.manifest = manifest;
    const loaderFactory = await LoaderFactory.create(this)

    await this.lifecycleManager.emitHook('configWillLoad');
    const config = await loaderFactory.loadConfig(manifest);
    this.config = config;
    await this.lifecycleManager.emitHook('configDidLoad', config);

    await loaderFactory.loadManifest(manifest);
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
