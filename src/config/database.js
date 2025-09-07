const { Sequelize } = require('sequelize');
const config = require('./config');

let sequelize;

if (config.db.useUrl && config.db.url) {
  // Conexão via URL (Supabase/produção)
  sequelize = new Sequelize(config.db.url, {
    dialect: config.db.dialect,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,           // obriga SSL
        rejectUnauthorized: false // ignora self-signed cert
      }
    }
  });
  console.log('🔒 Conectando via URL com SSL (produção)');
} else {
  // Conexão local via host/user/password
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
  console.log('💻 Conectando local sem SSL');
}

module.exports = sequelize;
