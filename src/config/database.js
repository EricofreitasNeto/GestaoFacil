require('dotenv').config();
const  { Sequelize } = require('sequelize');

/**const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', 
    logging: true, // Desativa os logs
  }
);
console.log('Senha do banco:', process.env.DB_PASSWORD);

module.exports = sequelize;**/
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Desativa os logs no console
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // necessário para Supabase
    }
  }
});

module.exports = sequelize;