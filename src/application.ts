import { Container, Injectable, Inject } from '@artus/injection';
import { artusContainer } from '.';
import { ARTUS_TRIGGER_ID } from './constraints';
import { ArtusStdError, ExceptionHandler, initException } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Trigger } from './trigger';
import { Application } from './types';

@Injectable()
export class ArtusApplication implements Application {
  @Inject(ARTUS_TRIGGER_ID)
  // @ts-ignore
  public trigger: Trigger;

  @Inject(ExceptionHandler)
  // @ts-ignore
  public exceptionHandler: ExceptionHandler;

  public manifest?: Manifest;
  private container: Container = artusContainer;
  public config?: Record<string, any>;
  private lifecycleManager: LifecycleManager;

  constructor() {
    this.lifecycleManager = new LifecycleManager(this);

    this.registerHook('didLoad', initException);

    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }


  async load(manifest: Manifest) {
    this.manifest = manifest;
    const loaderFactory = await LoaderFactory.create(this.container)

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
    this.exceptionHandler.throw(code);
  }

  createException(code: string): ArtusStdError {
    return this.exceptionHandler.create(code);
  }
}

export {
  Application
};
