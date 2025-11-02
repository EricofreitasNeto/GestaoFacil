// config/config.js - usado pelo sequelize-cli
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'gestaofacil',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: false,
};

const hasUrl = !!process.env.DATABASE_URL;

const fromUrl = {
  use_env_variable: 'DATABASE_URL',
  dialect: base.dialect,
  logging: false,
};

module.exports = {
  development: hasUrl ? fromUrl : { ...base },
  test: hasUrl
    ? fromUrl
    : { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: hasUrl ? fromUrl : { ...base },
};

