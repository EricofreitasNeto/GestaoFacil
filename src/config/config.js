require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (required && (value === undefined || value === '')) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${name}`);
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

console.log('✅ APP_MODE:', config.appMode);
console.table(config.db);

module.exports = config;