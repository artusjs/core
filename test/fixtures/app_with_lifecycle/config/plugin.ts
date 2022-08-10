import path from 'path';

export default {
  pluginA: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-a'),
  },

  pluginB: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-b'),
  },
};
