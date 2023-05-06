import path from 'path';

export default {
  'plugin-with-entry-a': {
    enable: false,
    path: path.resolve(__dirname, '../../plugin_with_entry_a'),
  },
  preset_b: {
    enable: false,
    path: path.resolve(__dirname, '../../preset_b'),
  },
  preset_c: {
    enable: true,
    path: path.resolve(__dirname, '../../preset_c'),
  },
  // Should overwrite preset_b
  a: {
    enable: false,
  },
};

