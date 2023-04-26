import 'reflect-metadata';
import { Container } from '@artus/injection';
import { ArtusInjectEnum } from './constant';
import { ArtusStdError } from './exception';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest, ManifestV2 } from './loader';
import { Application, ApplicationInitOptions } from './types';
import Trigger from './trigger';
import ConfigurationHandler from './configuration';
import { Logger, LoggerType } from './logger';

export class ArtusApplication implements Application {
  public manifest?: Manifest | ManifestV2;
  public envList?: string[];
  public container: Container;

  protected lifecycleManager: LifecycleManager;
  protected loaderFactory: LoaderFactory;

  constructor(opts?: ApplicationInitOptions) {
    this.container = new Container(opts?.containerName ?? ArtusInjectEnum.DefaultContainerName);
    this.lifecycleManager = new LifecycleManager(this, this.container);
    this.loaderFactory = new LoaderFactory(this.container);

    if (opts?.env) {
      this.envList = [].concat(opts.env);
    }

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

  get packages(): Record<string, any> {
    return this.container.get(ArtusInjectEnum.Packages);
  }

  get configurationHandler(): ConfigurationHandler {
    return this.container.get(ConfigurationHandler);
  }

  get logger(): LoggerType {
    return this.container.get(Logger);
  }

  loadDefaultClass() {
    // load Artus default clazz
    this.container.set({ id: Container, value: this.container });
    this.container.set({ id: ArtusInjectEnum.Application, value: this });
    this.container.set({ id: ArtusInjectEnum.LifecycleManager, value: this.lifecycleManager });
    this.container.set({ id: ArtusInjectEnum.Config, value: {} });

    this.container.set({ type: ConfigurationHandler });
    this.container.set({ type: Logger });
    this.container.set({ type: Trigger });
  }

  async load(manifest: Manifest | ManifestV2, root: string = process.cwd()) {
    // Load user manifest
    this.manifest = manifest;

    await this.loaderFactory.loadManifest(manifest, manifest.relative ? root : undefined, this.envList);

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
          this.container.set({
            id: ArtusInjectEnum.Config,
            value: this.configurationHandler.getMergedConfig(this.envList),
          });
          return this.lifecycleManager.emitHook('configDidLoad');
        },
      });
  }
}
