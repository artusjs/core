import 'reflect-metadata';
import { Container } from '@artus/injection';
import { ArtusInjectEnum } from './constant';
import { ArtusStdError } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
import { mergeConfig } from './loader/utils/merge';
import { Application, ApplicationInitOptions } from './types';
import ConfigurationHandler from './configuration';
import { Logger, LoggerType } from './logger';

export class ArtusApplication implements Application {
  public manifest?: Manifest;
  public container: Container;

  constructor(opts?: ApplicationInitOptions) {
    this.container = new Container(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);

    if (opts?.env) {
      const envList = [].concat(opts.env);
      this.container.set({ id: ArtusInjectEnum.EnvList, value: envList });
    }
    this.loadDefaultClass();
    this.addLoaderListener();

    process.on('SIGINT', () => this.close(true));
    process.on('SIGTERM', () => this.close(true));
  }

  get config(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Config);
  }

  get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
  }

  get lifecycleManager(): LifecycleManager {
    return this.container.get(LifecycleManager);
  }

  get loaderFactory(): LoaderFactory {
    return this.container.get(LoaderFactory);
  }

  get logger(): LoggerType {
    return this.container.get(Logger);
  }

  loadDefaultClass() {
    // load Artus default clazz
    this.container.set({ id: Container, value: this.container });
    this.container.set({ id: ArtusInjectEnum.Application, value: this });
    this.container.set({ id: ArtusInjectEnum.Config, value: {} });

    this.container.set({ type: ConfigurationHandler });
    this.container.set({ type: LoaderFactory });
    this.container.set({ type: LifecycleManager });
    this.container.set({ type: Logger });
  }

  async load(manifest: Manifest, root: string = process.cwd()) {
    // Load user manifest
    this.manifest = manifest;

    await this.loaderFactory.loadManifest(manifest, root);

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
      // reverse emitHook to avoid plugin closed before app hook
      await this.lifecycleManager.emitHook('beforeClose', null, true);
    } catch (e) {
      throw new Error(e);
    }
    if (exit) {
      process.exit(0);
    }
  }

  throwException(code: string): void {
    throw new ArtusStdError(code);
  }

  createException(code: string): ArtusStdError {
    return new ArtusStdError(code);
  }

  protected addLoaderListener() {
    this.loaderFactory
      .addLoaderListener('config', {
        before: () => this.lifecycleManager.emitHook('configWillLoad'),
        after: () => {
          this.updateConfig();
          return this.lifecycleManager.emitHook('configDidLoad');
        },
      });
  }

  protected updateConfig() {
    const oldConfig = this.container.get(ArtusInjectEnum.Config, { noThrow: true }) ?? {};
    const newConfig = this.configurationHandler.getMergedConfig() ?? {};
    this.container.set({
      id: ArtusInjectEnum.Config,
      value: mergeConfig(oldConfig, newConfig),
    });
  }
}
