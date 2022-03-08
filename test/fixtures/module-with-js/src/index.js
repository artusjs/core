const path = require('path');

const rootDir = path.resolve(__dirname, './');

module.exports = ({
  rootDir,
  units: [
    {
      loader: 'module',
      id: 'testServiceA',
      path: path.resolve(rootDir, './testServiceA.js')
    },
    {
      loader: 'module',
      id: 'testServiceB',
      path: path.resolve(rootDir, './testServiceB.js')
    }
  ]
});
