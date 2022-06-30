import { Injectable } from "../../../src/index";

@Injectable()
export default class Custom {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}