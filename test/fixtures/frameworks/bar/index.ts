import { DefineFramework } from '../../../../src';
import { FrameworkFoo as Foo } from '../foo';
import path from 'path';

@DefineFramework({
  configDir: path.join(__dirname, 'config')
})
export class FrameworkBar extends Foo {

}
