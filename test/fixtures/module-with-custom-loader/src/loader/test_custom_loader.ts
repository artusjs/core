
import { DefineLoader, Loader, LoaderCheckOptions, ManifestItem } from '../../../../../src';
import compatibleRequire from '../../../../../src/utils/compatible-require';

@DefineLoader('test-custom-loader')
export default class TestCustomLoader implements Loader {
  async is(opts: LoaderCheckOptions) {
    return opts.filename === 'testClazz.ts'
  }

  async load(item: ManifestItem) {
    const clazz = await compatibleRequire(item.path);
    console.log('TestCustomLoader.load ' + clazz.name);
  }
}