// ─── Módulos base ─────────────────────────────────────────────
require('module-alias/register');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const isPkg = typeof process.pkg !== 'undefined';
const envPath = isPkg
  ? path.join(path.dirname(process.execPath), '.env')
  : path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: envPath });
const APP_MODE = process.env.APP_MODE || 'production';
const PORT = process.env.PORT || 3000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// ─── Debug ────────────────────────────────────────────────────
if (process.argv.includes('--debug')) {
  console.log('🐞 Modo DEBUG ativado');
}

// ─── Express e segurança ──────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// ─── Swagger Docs ─────────────────────────────────────────────

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestão Fácil API',
      version: '1.0.0',
      description: 'Documentação da API de Gestão de Ativos e Serviços',
      contact: {
        name: 'Seu Nome',
        email: 'seu@email.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      },
      {
        url: 'https://gestaofacil.onrender.com',
        description: 'Servidor produção'
      }
    ],
    tags: [
      { name: 'Autenticação', description: 'Endpoints de login e registro' },
      { name: 'Clientes', description: 'Gestão de clientes' },
      { name: 'Usuários', description: 'Gestão de usuários' },
      { name: 'Ativos', description: 'Gestão de ativos' },
      { name: 'Locais', description: 'Gestão de locais' },
      { name: 'Serviços', description: 'Gestão de serviços técnicos' },
      { name: 'Tipos de Serviços', description: 'Classificação dos serviços' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// ─── Middlewares globais ──────────────────────────────────────
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
    const user = req.user || {};
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms) | IP: ${ip} | User: ${user.email || 'anon'} | Cargo: ${user.cargo || 'n/a'}`);
  });
  next();
});

// ─── Imports com compatibilidade pkg ──────────────────────────
const db = isPkg ? require('../src/models') : require('@models');
const authenticateJWT = isPkg ? require('../src/middlewares/authMiddleware') : require('@middlewares/authMiddleware');
const routes = {
  auth: isPkg ? require('../src/routes/authRoutes') : require('@routes/authRoutes'),
  clientes: isPkg ? require('../src/routes/clienteRoutes') : require('@routes/clienteRoutes'),
  usuarios: isPkg ? require('../src/routes/usuarioRoutes') : require('@routes/usuarioRoutes'),
  servicos: isPkg ? require('../src/routes/servicoRoutes') : require('@routes/servicoRoutes'),
  ativos: isPkg ? require('../src/routes/ativoRoutes') : require('@routes/ativoRoutes'),
  locais: isPkg ? require('../src/routes/localRoutes') : require('@routes/localRoutes'),
  tiposervico: isPkg ? require('../src/routes/tipoServicoRoutes') : require('@routes/tipoServicoRoutes')
};

// ─── Rotas principais ─────────────────────────────────────────
app.use('/auth', routes.auth);

const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), routes.clientes);
apiRouter.use('/usuarios', authenticateJWT(), routes.usuarios);
apiRouter.use('/servicos', authenticateJWT(), routes.servicos);
apiRouter.use('/ativos', authenticateJWT(), routes.ativos);
apiRouter.use('/locais', authenticateJWT(), routes.locais);
apiRouter.use('/tipos-servicos', authenticateJWT(), routes.tiposervico);
app.use('/v1', apiRouter);

// ─── Rotas básicas ────────────────────────────────────────────
app.get('/', (_, res) => res.send('🚀 API Gestão Fácil rodando com sucesso!'));
app.get('/teste', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/uptime', (_, res) => {
  const seconds = Math.floor(process.uptime());
  const formatted = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;
  res.send(`⏱️ Uptime da aplicação: ${formatted}`);
});

// ─── Erros globais ────────────────────────────────────────────
process.on('uncaughtException', err => console.error('❌ Erro não tratado:', err));
process.on('unhandledRejection', reason => console.error('❌ Promessa rejeitada sem tratamento:', reason));

app.use((err, req, res, next) => {
  console.error('🔥 Erro interno:', err.stack || err.message || err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// ─── Inicialização segura ────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

async function startServer() {
  console.log(`🧠 APP_MODE: ${APP_MODE}, USE_HTTPS: ${USE_HTTPS}`);
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    await db.sequelize.sync();
    console.log('🔄 Modelos sincronizados');

    const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
    const certPath = path.join(basePath, 'certs', 'server.cert');
    const keyPath = path.join(basePath, 'certs', 'server.key');
    console.log('🔍 basePath:', basePath);
    console.log('🔍 certPath:', certPath);
    console.log('🔍 keyPath:', keyPath);

    const serverCallback = () => {
      const ip = getLocalIP();
      const protocol = USE_HTTPS ? 'https' : 'http';
      console.log(`🟢 Servidor rodando em ${protocol}://${ip}:${PORT}`);
    };

    const isProduction = APP_MODE === 'production';

if (USE_HTTPS && isProduction) {
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', serverCallback);
  } else {
    console.warn('⚠️ Certificados HTTPS não encontrados. Caindo para HTTP...');
    http.createServer(app).listen(PORT, '0.0.0.0', serverCallback);
  }
} else {
  console.log('🔧 Ambiente local ou HTTPS desativado. Usando HTTP.');
  http.createServer(app).listen(PORT, '0.0.0.0', serverCallback);
}


    setInterval(() => {
      console.log(`⏱️ Uptime: ${Math.floor(process.uptime())}s`);
      console.log('🟢 Servidor ativo...');
    }, 60000);

  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();