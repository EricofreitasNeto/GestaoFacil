const { Sequelize } = require('sequelize');
const config = require('./config');

const useUrl = !!process.env.DATABASE_URL; // true se DATABASE_URL existir

let sequelize;

if (useUrl) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
  console.log('🔒 Conectando via DATABASE_URL com SSL (produção)');
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT,
      logging: false
    }
  );
  console.log('💻 Conectando local sem SSL');
}

module.exports = sequelize;
