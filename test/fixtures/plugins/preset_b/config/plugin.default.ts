import path from 'path';

export default {
  'plugin-with-entry-b': {
    enable: true,
    path: path.resolve(__dirname, '../../plugin_with_entry_b'),
  },
  a: {
    enable: true,
    path: path.resolve(__dirname, '../../plugin_a'),
  },
  b: {
    enable: true,
    path: path.resolve(__dirname, '../../plugin_b'),
  },
};
