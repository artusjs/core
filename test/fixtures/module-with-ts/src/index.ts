import path from 'path';

const rootDir = path.resolve(__dirname, './');

export default ({
  rootDir,
  items: [
    {
      loader: 'module',
      path: path.resolve(rootDir, './testServiceA.ts')
    },
    {
      loader: 'module',
      path: path.resolve(rootDir, './testServiceB.ts')
    }
  ]
});
