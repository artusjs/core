import path from 'path';

export default {
  mysql: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus_plugin_mysql_rds')
  },
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus_plugin_redis')
  },
  base: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus_plugin_base')
  }
}