import { Injectable } from "../../../../src";

@Injectable()
export class Mysql {
  private name = 'mysql';

  getName() {
    return this.name;
  }
}

export const number = 1;

export const object = { a: 1 };


export class Mysql2 {
  private name = 'mysql2';

  getName() {
    return this.name;
  }
}