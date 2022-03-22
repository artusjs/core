import { artusContainer } from '..';
import { HOOK_META_SYMBOL } from '../constraints';
import { Application } from '../types';

export type HookFunction = <T = unknown>(hookProps : {
  app: Application,
  lifecycleManager: LifecycleManager,
  payload?: T
}) => Promise<void>;

export class LifecycleManager {
  hookList: string[] = [
    'configWillLoad', // 配置文件即将加载，这是最后动态修改配置的时机
    'configDidLoad', // 配置文件加载完成
    'didLoad', // 文件加载完成
    'willReady', // 插件启动完毕
    'didReady', // 应用启动完成
    'beforeClose' // 应用即将关闭
  ];
  hookFnMap: Map<string, HookFunction[]> = new Map();
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  insertHook(existHookName: string, newHookName: string) {
    const startIndex = this.hookList.findIndex((val) => val === existHookName);
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
        hookFn
      ]);
    }
  }

  async emitHook<T = unknown>(hookName: string, payload?: T) {
    if (!this.hookFnMap.has(hookName)) {
      return;
    }
    const fnList = this.hookFnMap.get(hookName);
    if (!Array.isArray(fnList)) {
      return;
    }
    for (const hookFn of fnList) {
      let that: any;
      if (hookFn[HOOK_META_SYMBOL]) {
        try {
          that = artusContainer.get(hookFn[HOOK_META_SYMBOL]);
        } catch (error) {
          // SEEME: 临时行为，待 injection 的 get 提供参数允许 id 不存在
        }
      }
      await hookFn.call(that, {
        app: this.app,
        lifecycleManager: this,
        payload
      });
    }
  }
};
