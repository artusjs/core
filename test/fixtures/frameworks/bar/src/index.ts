import { Inject, Injectable } from "@artus/injection";
import { AbstractFoo } from "../../abstract/foo";

export interface AbstractBar extends AbstractFoo { }

@Injectable({ id: 'ABSTRACT_BAR' })
export default class FrameworkBar implements AbstractBar {
  @Inject('ABSTRACT_FOO')
  private foo: AbstractFoo;

  isListening() {
    return this.foo.isListening();
  }
}


export * from './http';