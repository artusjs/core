import { Injectable, ScopeEnum } from "../../../../src";

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class Redis {
  private name = 'redis';

  getName() {
    return this.name;
  }
}

@Injectable()
export class Redis2 {
  private name = 'redis2';

  getName() {
    return this.name;
  }
}

export { Redis };