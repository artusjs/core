import path from 'path';

export default {
  mysql: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus_plugin_mysql_ob'),
  },
  redis: {
    enable: false,
  },
};