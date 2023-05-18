import path from 'path';

export default {
  'plugin-with-entry-c': {
    enable: false,
    path: path.resolve(__dirname, '../../plugin_with_entry_c'),
  },
  // Should overwrite preset_b
  b: {
    enable: false,
    path: path.resolve(__dirname, '../../plugin_b'),
  },
  c: {
    enable: false,
    path: path.resolve(__dirname, '../../plugin_c'),
  },
  d: {
    enable: true,
    path: path.resolve(__dirname, '../../plugin_d'),
  },
};

