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
        url: 'https://seu-dominio.com',
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
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Banco de dados conectado');
    await db.sequelize.sync();
    console.log('🔄 Modelos sincronizados');

    const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
    const certPath = path.join(basePath, 'certs', 'server.cert');
    const keyPath = path.join(basePath, 'certs', 'server.key');

    // HTTP sempre
    http.createServer(app).listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`🔧 HTTP rodando em http://localhost:${process.env.PORT}`);
    });

    // HTTPS se habilitado
    if (process.env.USE_HTTPS === 'true' && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      const sslPort = process.env.PORT_SSL || 3443;
      https.createServer(sslOptions, app).listen(sslPort, () => {
        console.log(`✅ HTTPS rodando em https://localhost:${process.env.PORT_SSL}`);
      });
    } else {
      console.warn('⚠️ HTTPS desativado ou certificados não encontrados');
    }

    // Uptime log
    setInterval(() => {
      console.log(`⏱️ Uptime: ${Math.floor(process.uptime())}s`);
      console.log('🟢 Servidor ativo...');
    }, 60000);

  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err.message);
    process.exit(1);
  }
}

startServer();
