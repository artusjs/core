import { Container } from '@artus/injection';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { Application } from './types';

const ROOT_CONTAINER_NAME = 'artus-application-root';

export class ArtusApplication implements Application {
  private container: Container;
  private lifecycleManager: LifecycleManager;

  constructor() {
    this.container = new Container(ROOT_CONTAINER_NAME);
    this.lifecycleManager = new LifecycleManager(this);

    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  async load(manifest: Manifest) {
    // TODO: 需要增加 loadConfig及对应的钩子
    await LoaderFactory.create(this.container)
      .loadManifest(manifest);
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
}

export {
  Application
};
