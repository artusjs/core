import { Injectable, ScopeEnum } from "@artus/injection";
import { ArtusApplication } from '../../../../../../../src';
import { server } from './lifecycle';

@Injectable({
  id: 'ABSTRACT_FOO',
  scope: ScopeEnum.SINGLETON,
})
export default class FrameworkFoo extends ArtusApplication {
  isListening(): boolean {
    return server?.listening;
  }
}
