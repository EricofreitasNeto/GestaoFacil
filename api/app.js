// ─── Módulos base ─────────────────────────────────────────────
require('module-alias/register');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const https = require('https');

// ─── Configuração de paths e variáveis ─────────────────────────
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);
require('dotenv').config({ path: resolvePath('.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const APP_MODE = process.env.APP_MODE || 'production';

// ─── Debug opcional ────────────────────────────────────────────
const isDebug = process.argv.includes('--debug');
if (isDebug) {
  console.log('🐞 Modo DEBUG ativado');
  console.log('📂 CWD:', process.cwd());
  console.log('📁 BasePath usado:', resolvePath());
}

// ─── Segurança e cabeçalhos CSP ───────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; " +
    "style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; " +
    "font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://gestaofacil.onrender.com http://localhost:3000; " +
    "img-src 'self' https://ui-avatars.com data: https:;"
  );
  next();
});

// ─── Servir arquivos estáticos ─────────────────────────────────
const publicPath = path.join(__dirname, 'public');
console.log('📁 Public path:', publicPath);
app.use('/public', express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    if (path.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
  }
}));

// Modo de manutenção (controlado por MAINTENANCE_MODE)
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
if (MAINTENANCE_MODE) {
  app.use((req, res, next) => {
    // Permite apenas rotas essenciais durante manutenção
    if (
      req.path === '/health' ||
      req.path === '/config.js' ||
      req.path.startsWith('/public') ||
      req.path.startsWith('/docs')
    ) {
      return next();
    }
    res.status(503).sendFile(path.join(publicPath, 'maintenance.html'));
  });
}

// Scripts e CSS (garante existência das pastas)
['scripts', 'css'].forEach(folder => {
  const dir = path.join(__dirname, 'public', folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Pasta criada: ${dir}`);
  }
  app.use(`/api/public/${folder}`, express.static(dir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      if (path.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
    }
  }));
});

// ─── Páginas básicas ───────────────────────────────────────────
app.get(['/', '/teste'], (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ─── Imports e rotas ───────────────────────────────────────────
const db = require('@models');
const authenticateJWT = require('@middlewares/authMiddleware');
const clienteRoutes = require('@routes/clienteRoutes');
const usuarioRoutes = require('@routes/usuarioRoutes');
const servicoRoutes = require('@routes/servicoRoutes');
const ativoRoutes = require('@routes/ativoRoutes');
const localRoutes = require('@routes/localRoutes');
const tipoServicoRoutes = require('@routes/tipoServicoRoutes');
const authRoutes = require('@routes/authRoutes');

// ─── Tratamento global de erros ────────────────────────────────
process.on('uncaughtException', err => console.error('❌ Erro não tratado:', err));
process.on('unhandledRejection', reason => console.error('❌ Promessa rejeitada:', reason));

// ─── Swagger Docs ──────────────────────────────────────────────
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestão Fácil API',
      version: '1.0.0',
      description: 'Documentação da API de Gestão de Ativos e Serviços',
      contact: { name: 'Equipe Gestão Fácil', email: 'contato@gestaofacil.com' }
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' },
      { url: 'https://gestaofacil.onrender.com', description: 'Servidor produção' }
    ],
    tags: [
      { name: 'Autenticação', description: 'Endpoints de login e registro' },
      { name: 'Clientes', description: 'Gestão de clientes' },
      { name: 'Usuários', description: 'Gestão de usuários' },
      { name: 'Ativos', description: 'Gestão de ativos' },
      { name: 'Locais', description: 'Gestão de locais' },
      { name: 'Serviços', description: 'Gestão de serviços técnicos' },
      { name: 'Tipos de Serviços', description: 'Classificação de serviços' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// ─── Middlewares globais ───────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Log detalhado de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { method, originalUrl, statusCode } = req;
    const user = req.user || {};
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} → ${statusCode} (${duration}ms) | IP: ${ip} | User: ${user.email || 'anon'} | Cargo: ${user.cargo || 'n/a'}`);
  });
  next();
});

// ─── Rotas de debug ───────────────────────────────────────────
app.get('/api/debug/scripts', (req, res) => {
  const scriptDir = path.join(__dirname, 'public', 'scripts');
  try {
    if (!fs.existsSync(scriptDir)) {
      return res.status(404).json({ success: false, error: 'Pasta não encontrada', scriptPath: scriptDir });
    }
    const files = fs.readdirSync(scriptDir).map(file => {
      const filePath = path.join(scriptDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size, url: `/api/public/scripts/${file}` };
    });
    res.json({ success: true, total: files.length, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Config.js dinâmico para frontend ─────────────────────────
app.get('/config.js', (req, res) => {
  try {
    const envBase = process.env.PUBLIC_API_BASE_URL;
    const defaultBase = `${req.protocol}://${req.get('host')}`;
    const baseUrl = envBase || defaultBase;
    const payload = `// Gerado dinamicamente\nwindow.API_BASE_URL = ${JSON.stringify(baseUrl)};\n`;
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(payload);
  } catch {
    res.status(500).send('window.API_BASE_URL = null;');
  }
});

// ─── Rotas públicas e healthcheck ─────────────────────────────
app.use('/auth', authRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()) });
});

// ─── Rotas protegidas (API v1) ─────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tipos-servicos', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

// ─── Banco de dados ───────────────────────────────────────────
db.sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados'))
  .catch(err => console.error('Erro ao conectar ao banco:', err));

db.sequelize.sync()
  .then(() => console.log('Modelos sincronizados'))
  .catch(err => console.error('Erro ao sincronizar modelos:', err));

// ─── Inicialização do servidor ─────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Modo: ${APP_MODE}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
// Keep-alive: ping Render URL every 5 minutes
// Control via env: KEEP_ALIVE_ENABLED, KEEP_ALIVE_URL, KEEP_ALIVE_INTERVAL_MS
try {
  const { startKeepAlive } = require('../src/services/keepAlive');
  startKeepAlive();
} catch (e) {
  console.warn('[keepAlive] Failed to start:', e?.message || e);
}
