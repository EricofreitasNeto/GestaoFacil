const { Sequelize } = require('sequelize');
const config = require('./config');

let sequelize;

const isProduction = config.appMode === 'production';

if (config.db.useUrl && config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    dialect: config.db.dialect,
    logging: false,
    dialectOptions: {
      ssl: isProduction
        ? { require: true, rejectUnauthorized: true } // segurança total em produção
        : { require: true, rejectUnauthorized: false } // flexível em dev
    }
  });
} else {
  sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      dialect: config.db.dialect,
      logging: false
    }
  );
}

module.exports = sequelize;