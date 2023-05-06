import { Constructable, Container, Inject, Injectable } from '@artus/injection';
import { Application, ApplicationLifecycle } from '../types';
import {
  ArtusInjectEnum,
  HOOK_NAME_META_PREFIX,
} from '../constant';

export type HookFunction = <T = unknown>(hookProps: {
  app: Application,
  lifecycleManager: LifecycleManager,
  payload?: T
}) => void | Promise<void>;

@Injectable()
export class LifecycleManager {
  public enable = true; // Enabled default, will NOT emit when enable is false

  private hookList: string[] = [
    'configWillLoad', // 配置文件即将加载，这是最后动态修改配置的时机
    'configDidLoad', // 配置文件加载完成
    'didLoad', // 文件加载完成
    'willReady', // 插件启动完毕
    'didReady', // 应用启动完成
    'beforeClose', // 应用即将关闭
  ];
  private hookFnMap: Map<string, HookFunction[]> = new Map();
  private hookUnitSet: Set<Constructable<ApplicationLifecycle>> = new Set();

  @Inject(ArtusInjectEnum.Application)
  private app: Application;

  @Inject()
  private container: Container;

  insertHook(existHookName: string, newHookName: string) {
    const startIndex = this.hookList.findIndex(val => val === existHookName);
    this.hookList.splice(startIndex, 0, newHookName);
  }

  appendHook(newHookName: string) {
    this.hookList.push(newHookName);
  }

  registerHook(hookName: string, hookFn: HookFunction) {
    if (this.hookFnMap.has(hookName)) {
      this.hookFnMap.get(hookName)?.push(hookFn);
    } else {
      this.hookFnMap.set(hookName, [
        hookFn,
      ]);
    }
  }

  registerHookUnit(extClazz: Constructable<any>) {
    if (this.hookUnitSet.has(extClazz)) {
      return;
    }
    this.hookUnitSet.add(extClazz);
    const fnMetaKeys = Reflect.getMetadataKeys(extClazz);
    const extClazzInstance = this.container.get(extClazz);
    for (const fnMetaKey of fnMetaKeys) {
      if (typeof fnMetaKey !== 'string' || !fnMetaKey.startsWith(HOOK_NAME_META_PREFIX)) {
        continue;
      }
      const hookName = Reflect.getMetadata(fnMetaKey, extClazz);
      const propertyKey = fnMetaKey.slice(HOOK_NAME_META_PREFIX.length);
      this.registerHook(hookName, extClazzInstance[propertyKey].bind(extClazzInstance));
    }
  }

  async emitHook<T = unknown>(hookName: string, payload?: T) {
    if (!this.enable) {
      return;
    }
    if (!this.hookFnMap.has(hookName)) {
      return;
    }
    const fnList = this.hookFnMap.get(hookName);
    if (!Array.isArray(fnList)) {
      return;
    }
    // lifecycle hook should only trigger one time
    this.hookFnMap.delete(hookName);
    for (const hookFn of fnList) {
      await hookFn({
        app: this.app,
        lifecycleManager: this,
        payload,
      });
    }
  }
}
