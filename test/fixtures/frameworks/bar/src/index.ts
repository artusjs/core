import { Inject } from "@artus/injection"
import { AbstractFoo } from "../../abstract/foo";

export interface AbstractBar extends AbstractFoo { };

export class FrameworkBar implements AbstractBar {
  @Inject('ABSTRACT_BAR')
  // @ts-ignore
  private foo: AbstractFoo;

  isListening() {
    return this.foo.isListening();
  }
}


export * from './http';