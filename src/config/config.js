const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log('✅ APP_MODE:', process.env.APP_MODE);



function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (required && (value === undefined || value === '')) {
    console.warn(`⚠️ Variável de ambiente não definida: ${name}`);
    return null;
  }
  return value;
}

function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (required && (value === undefined || value === '')) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}
console.log('\n📦 Variáveis de ambiente carregadas:');
console.table({
  APP_MODE: process.env.APP_MODE,
  PORT: process.env.PORT,
  USE_HTTPS:process.env.USE_HTTPS,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_DIALECT: process.env.DB_DIALECT
});

const config = {
  app: {
    mode: getEnvVar('APP_MODE', true),
    allowedOrigins: getEnvVar('ALLOWED_ORIGINS', false)?.split(',') || '*',
    userhttps:getEnvVar('USE_HTTPS', true),
    jwtSecret: getEnvVar('JWT_SECRET', true)
  },
  db: {
    useUrl: !!process.env.DATABASE_URL,
    url: getEnvVar('DATABASE_URL', false),
    name: getEnvVar('DB_NAME', false),
    user: getEnvVar('DB_USER', false),
    password: getEnvVar('DB_PASSWORD', false),
    host: getEnvVar('DB_HOST', false),
    port: getEnvVar('DB_PORT', false),
    dialect: getEnvVar('DB_DIALECT', false) || 'postgres'
  }
};

module.exports = config;