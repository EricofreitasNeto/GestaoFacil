// ─── Módulos base ─────────────────────────────────────────────
require('module-alias/register');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ─── Express e segurança ──────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const isPkg = typeof process.pkg !== 'undefined';

// ─── Imports com compatibilidade pkg ──────────────────────────
const db = isPkg ? require('../src/models') : require('@models');
const authenticateJWT = isPkg ? require('../src/middlewares/authMiddleware') : require('@middlewares/authMiddleware');
const clienteRoutes = isPkg ? require('../src/routes/clienteRoutes') : require('@routes/clienteRoutes');
const usuarioRoutes = isPkg ? require('../src/routes/usuarioRoutes') : require('@routes/usuarioRoutes');
const servicoRoutes = isPkg ? require('../src/routes/servicoRoutes') : require('@routes/servicoRoutes');
const ativoRoutes = isPkg ? require('../src/routes/ativoRoutes') : require('@routes/ativoRoutes');
const localRoutes = isPkg ? require('../src/routes/localRoutes') : require('@routes/localRoutes');
const tipoServicoRoutes = isPkg ? require('../src/routes/tipoServicoRoutes') : require('@routes/tipoServicoRoutes');
const authRoutes = isPkg ? require('../src/routes/authRoutes') : require('@routes/authRoutes');

// ─── Tratamento de erros globais ──────────────────────────────
process.on('uncaughtException', err => {
  console.error('❌ Erro não tratado:', err);
});
process.on('unhandledRejection', reason => {
  console.error('❌ Promessa rejeitada sem tratamento:', reason);
});

// ─── Middlewares ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

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

    console.log([
      `[${new Date().toISOString()}]`,
      `${method} ${url}`,
      `→ ${status} (${duration}ms)`,
      `| IP: ${ip}`,
      `| User: ${user.email || 'anon'}`,
      `| Cargo: ${user.cargo || 'n/a'}`
    ].join(' '));
  });
  next();
});

// ─── Rotas ────────────────────────────────────────────────────
app.use('/auth', authRoutes);

const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tiposervico', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

// ─── Banco de dados ───────────────────────────────────────────
console.log("DATABASE_URL:", process.env.DATABASE_URL);

db.sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

db.sequelize.sync()
  .then(() => console.log('🔄 Modelos sincronizados'))
  .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));

// ─── Rotas básicas ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🚀 API Gestão Fácil rodando com sucesso!');
});

app.get('/teste', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teste.html'));
});

// ─── Inicialização do servidor ────────────────────────────────
const PORT = process.env.PORT || 3000;
const APP_MODE = process.env.APP_MODE || 'local';
const USE_HTTPS = process.env.USE_HTTPS === 'true';

function startServer() {
  if (APP_MODE === 'local') {
    const certPath = path.join(__dirname, 'certs', 'server.cert');
    const keyPath = path.join(__dirname, 'certs', 'server.key');

    if (USE_HTTPS && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`🔐 HTTPS rodando em https://localhost:${PORT}`);
      });
    } else {
      console.warn('⚠️ Certificados SSL não encontrados ou HTTPS desativado. Iniciando em HTTP...');
      http.createServer(app).listen(PORT, () => {
        console.log(`🟢 HTTP rodando em http://localhost:${PORT}`);
      });
    }
  } else {
    console.log('🚀 Rodando em modo serverless (Vercel)');
  }
}

startServer();