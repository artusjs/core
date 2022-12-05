import { Injectable, ScopeEnum } from '../../../src';

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class LifecycleList {
  lifecycleList: string[] = [];

  async add(name: string) {
    this.lifecycleList.push(name);
  }
}
