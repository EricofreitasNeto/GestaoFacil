const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (required && (value === undefined || value === '')) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

const allowedOriginsRaw = getEnvVar('ALLOWED_ORIGINS', false);

const config = {
  appMode: getEnvVar('APP_MODE', false),
  allowedOrigins: allowedOriginsRaw ? allowedOriginsRaw.split(',') : ['*'],
  jwtSecret: getEnvVar('JWT_SECRET', true),
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

const safeDbLog = {
  dialect: config.db.dialect,
  host: config.db.host || (config.db.useUrl ? 'via DATABASE_URL' : undefined),
  port: config.db.port,
  useUrl: config.db.useUrl
};
console.log('[config] APP_MODE:', config.appMode || 'not set');
console.log('[config] Database config:', safeDbLog);

module.exports = config;
