import { DefineFramework } from '../../../../src';
import { FrameworkBar as Bar } from '../bar';

@DefineFramework({
  path: __dirname
})
export class FrameworkFoo extends Bar {

}
