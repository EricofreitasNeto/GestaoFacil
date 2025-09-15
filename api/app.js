// ─── Módulos base ─────────────────────────────────────────────
require('module-alias/register');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Detecta se está rodando empacotado pelo pkg
const isPkg = typeof process.pkg !== 'undefined';

// Função utilitária para resolver caminhos corretamente
const resolvePath = (...segments) => {
  const base = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..');
  return path.join(base, ...segments);
};

// Carregar .env de fora do executável (mesma pasta do .exe)
require('dotenv').config({ path: resolvePath('.env') });

// ─── DEBUG ──────────────────────────────────────
const isDebug = process.argv.includes('--debug');
if (isDebug) {
  console.log('🐞 Modo DEBUG ativado');
  console.log('CWD:', process.cwd());
  console.log('BasePath usado:', resolvePath());
}

// ─── Express e segurança ──────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

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
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// ─── Rotas Públicas ────────────────────────────────────────────
const { resolve } = require('path');

// Rotas de autenticação (ex: login, register interno)
app.use('/auth', authRoutes);

// Caminho para o arquivo de teste
const filePath = resolve(__dirname, 'public', 'scripts', 'index.js');
console.log('Arquivo existe?', fs.existsSync(filePath));

// Servir arquivos estáticos da pasta /public
app.use(express.static(resolve(__dirname, 'public')));

// Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API Gestão Fácil rodando com sucesso!');
});

// Página de teste
app.get('/teste', (req, res) => {
  res.sendFile(resolve(__dirname, 'public', 'teste.html'));
});

// Página principal
app.get('/gestalfacil', (req, res) => {
  res.sendFile(resolve(__dirname, 'index.html'));
});


// ─── Rotas protegidas ──────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tipo-servico', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

// ─── Banco de dados ────────────────────────────────────────────
console.log('DATABASE_URL:', process.env.DATABASE_URL);

db.sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

db.sequelize.sync()
  .then(() => console.log('🔄 Modelos sincronizados'))
  .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));

// ─── Rotas básicas ─────────────────────────────────────────────
app.get('/uptime', (req, res) => {
  const seconds = Math.floor(process.uptime());
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const formatted = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  res.send(`⏱️ Uptime da aplicação: ${formatted}`);
});

// ─── Inicialização do servidor ────────────────────────────────
const PORT = process.env.PORT || 3000;
const APP_MODE = process.env.APP_MODE || 'production';
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const IP = '0.0.0.0';
const publicURL = process.env.RENDER_EXTERNAL_URL || `${IP},${PORT}`;

function startServer() {
  console.log(`🧠 APP_MODE: ${APP_MODE}, USE_HTTPS: ${USE_HTTPS}`);

  const certPath = resolvePath('certs', 'server.cert');
  const keyPath = resolvePath('certs', 'server.key');

  app.listen(PORT, IP, () => {
    console.log(`🚀 Servidor rodando em ${publicURL}`);
  });
}

startServer();