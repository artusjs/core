import { Injectable, ScopeEnum } from "../../../src/index";

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class Custom {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}