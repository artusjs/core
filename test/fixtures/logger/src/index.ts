import path from 'path';
import { Manifest } from '../../../../src';

const rootDir = path.resolve(__dirname, './');


const defaultManifest: Manifest =  {
  items: [
    {
      path: path.resolve(rootDir, './test_clazz.ts'),
      extname: '.ts',
      filename: 'test_clazz.ts'
    }
  ]
};

export const manifestWithCustomLogger: Manifest = {
  items: [
    ...defaultManifest.items,
    {
      path: path.resolve(rootDir, './test_custom_clazz.ts'),
      extname: '.ts',
      filename: 'test_custom_clazz.ts'
    },
    {
      path: path.resolve(rootDir, './custom_logger.ts'),
      extname: '.ts',
      filename: 'custom_logger.ts'
    }
  ]
};

export default defaultManifest;
