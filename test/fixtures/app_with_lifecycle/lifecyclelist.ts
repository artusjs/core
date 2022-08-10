import { Injectable } from '../../../src';

@Injectable()
export default class LifecycleList {
  lifecycleList: string[] = [];

  async add(name: string) {
    this.lifecycleList.push(name);
  }
}
