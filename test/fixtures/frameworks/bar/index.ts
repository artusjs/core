import { DefineFramework } from '../../../../src';
import { FrameworkFoo as Foo } from '../foo';

@DefineFramework({
  path: __dirname
})
export class FrameworkBar extends Foo {

}
