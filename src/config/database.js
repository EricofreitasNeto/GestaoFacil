const { Sequelize } = require('sequelize');
const config = require('./config');
const { verbose, isVerboseEnabled } = require('../utils/logger');

const isProduction = config.appMode === 'production';
const verboseEnabled = isVerboseEnabled();

const logSql = (message, timing) => {
  if (!verboseEnabled) return;
  const suffix = typeof timing === 'number' ? ` (${timing} ms)` : '';
  verbose(`[SQL] ${message}${suffix}`);
};

const baseOptions = {
  dialect: config.db.dialect,
  logging: verboseEnabled ? logSql : false,
};

let sequelize;

if (config.db.useUrl && config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    ...baseOptions,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: !isProduction, // aceita certificado autoassinado só fora da produção
      },
    },
  });
} else {
  sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    {
      ...baseOptions,
      host: config.db.host,
      port: config.db.port,
    }
  );
}

module.exports = sequelize;
