const { Sequelize } = require('sequelize');
const config = require('./config');

const isProduction = config.appMode === 'production';

let sequelize;

if (config.db.useUrl && config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    dialect: config.db.dialect,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: !isProduction // aceita certificado autoassinado só fora da produção
      }
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