require('module-alias/register');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const isPkg = typeof process.pkg !== 'undefined';

//Imports com compatibilidade pkg
const db = isPkg ? require('../src/models') : require('@models');
const authenticateJWT = isPkg ? require('../src/middlewares/authMiddleware') : require('@middlewares/authMiddleware');
const clienteRoutes = isPkg ? require('../src/routes/clienteRoutes') : require('@routes/clienteRoutes');
const usuarioRoutes = isPkg ? require('../src/routes/usuarioRoutes') : require('@routes/usuarioRoutes');
const servicoRoutes = isPkg ? require('../src/routes/servicoRoutes') : require('@routes/servicoRoutes');
const ativoRoutes = isPkg ? require('../src/routes/ativoRoutes') : require('@routes/ativoRoutes');
const localRoutes = isPkg ? require('../src/routes/localRoutes') : require('@routes/localRoutes');
const tipoServicoRoutes = isPkg ? require('../src/routes/tipoServicoRoutes') : require('@routes/tipoServicoRoutes');
const authRoutes = isPkg ? require('../src/routes/authRoutes') : require('@routes/authRoutes');

const app = express();

//Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// Body parsers com limite
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Limite de requisições
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

//Logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    const user = req.user || {};

    const log = [
      `[${new Date().toISOString()}]`,
      `${method} ${url}`,
      `→ ${status} (${duration}ms)`,
      `| IP: ${ip}`,
      `| User: ${user.email || 'anon'}`,
      `| Cargo: ${user.cargo || 'n/a'}`
    ].join(' ');

    console.log(log);
  });
  next();
});

// Rotas
app.use('/auth', authRoutes);

const apiRouter = express.Router();
apiRouter.use('/clientes',authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tiposervico', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

//Banco de dados
console.log("DATABASE_URL:", process.env.DATABASE_URL);

db.sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

db.sequelize.sync()
  .then(() => console.log('🔄 Modelos sincronizados'))
  .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));

// Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API Gestão Fácil rodando com sucesso!');
});

// Pagina
app.get('/teste', (req, res) => {
  res.sendFile(path.join(__dirname, './public/teste.html'));
});

// Inicialização
module.exports = app;
const appMode = process.env.APP_MODE || 'local';

if (process.env.APP_MODE === 'local') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🟢 Rodando localmente em http://localhost:${PORT}`);
  });
} else {
  console.log('🚀 Rodando em modo serverless (Vercel)');
}