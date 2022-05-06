import path from 'path';
import { DefineLoader, Loader, LoaderCheckOptions, Manifest, ManifestItem } from '../../../../src';
import compatibleRequire from '../../../../src/utils/compatible-require';

const rootDir = path.resolve(__dirname, './');

@DefineLoader('test-custom-loader')
export class TestCustomLoader implements Loader {
  async is(opts: LoaderCheckOptions) {
    return opts.filename === 'testClazz.ts'
  }

  async load(item: ManifestItem) {
    const clazz = await compatibleRequire(item.path);
    console.log('TestCustomLoader.load ' + clazz.name);
  }
}


export default ({
  items: [
    {
      path: path.resolve(rootDir, './testClazz.ts'),
      extname: '.ts',
      filename: 'testClazz.ts',
      loader: 'test-custom-loader'
    }
  ]
}) as Manifest;
