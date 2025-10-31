// ─── Módulos base ─────────────────────────────────────────────
require('module-alias/register');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// ─── Configuração de paths ────────────────────────────────────
const resolvePath = (...segments) => {
  return path.resolve(__dirname, ...segments);
};

require('dotenv').config({ path: resolvePath('.env') });

// ─── DEBUG ────────────────────────────────────────────────────
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

// ✅ CORREÇÃO COMPLETA DO CSP
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

// ✅ Servir arquivos estáticos corretamente
const publicPath = path.join(__dirname, 'public');
console.log('📁 Public path:', publicPath);

// Servir arquivos HTML e assets
app.use('/public', express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// ✅ Servir scripts
const scriptPath = path.join(__dirname, 'public', 'scripts');
console.log('📁 Script path:', scriptPath);

if (fs.existsSync(scriptPath)) {
  console.log('✅ Pasta de scripts encontrada:', scriptPath);
} else {
  console.log('❌ Pasta de scripts NÃO encontrada:', scriptPath);
  fs.mkdirSync(scriptPath, { recursive: true });
  console.log('📁 Pasta de scripts criada:', scriptPath);
}

app.use('/api/public/scripts', express.static(scriptPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      console.log('📦 Servindo arquivo JS:', path);
    }
  }
}));

// ✅ Servir CSS
const cssPath = path.join(__dirname, 'public', 'css');
console.log('📁 CSS path:', cssPath);

if (fs.existsSync(cssPath)) {
  console.log('✅ Pasta de CSS encontrada:', cssPath);
} else {
  console.log('❌ Pasta de CSS NÃO encontrada:', cssPath);
  fs.mkdirSync(cssPath, { recursive: true });
  console.log('📁 Pasta de CSS criada:', cssPath);
}

app.use('/api/public/css', express.static(cssPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      console.log('🎨 Servindo arquivo CSS:', path);
    }
  }
}));

// ✅ Rotas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/teste', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ─── Imports simplificados (sem pkg) ──────────────────────────
const db = require('@models');
const authenticateJWT = require('@middlewares/authMiddleware');
const clienteRoutes = require('@routes/clienteRoutes');
const usuarioRoutes = require('@routes/usuarioRoutes');
const servicoRoutes = require('@routes/servicoRoutes');
const ativoRoutes = require('@routes/ativoRoutes');
const localRoutes = require('@routes/localRoutes');
const tipoServicoRoutes = require('@routes/tipoServicoRoutes');
const authRoutes = require('@routes/authRoutes');

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
app.use(helmet({
  contentSecurityPolicy: false
}));
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

// ─── Rotas para debug ─────────────────────────────────────────
app.get('/api/debug/scripts', (req, res) => {
  const scriptDir = path.join(__dirname, 'public', 'scripts');
  
  try {
    if (!fs.existsSync(scriptDir)) {
      return res.status(404).json({
        success: false,
        error: 'Pasta de scripts não encontrada',
        scriptPath: scriptDir
      });
    }

    const files = fs.readdirSync(scriptDir);
    const fileInfo = files.map(file => {
      const filePath = path.join(scriptDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        accessible: true,
        url: `/api/public/scripts/${file}`,
        fullPath: filePath
      };
    });
    
    res.json({
      success: true,
      scriptPath: scriptDir,
      files: fileInfo,
      totalFiles: files.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      scriptPath: scriptDir
    });
  }
});

app.get('/api/debug/scripts/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'scripts', filename);
  
  try {
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        error: `Arquivo ${filename} não encontrado`,
        filePath: filePath
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      filePath: filePath
    });
  }
});

// ─── Rotas Públicas ────────────────────────────────────────────
app.use('/auth', authRoutes);
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// ─── Rotas protegidas ──────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tipos-servicos', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

// ─── Banco de dados ────────────────────────────────────────────
console.log('DATABASE_URL:', process.env.DATABASE_URL);

db.sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

db.sequelize.sync()
  .then(() => console.log('🔄 Modelos sincronizados'))
  .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));

// ─── Inicialização do servidor ────────────────────────────────
const PORT = process.env.PORT || 3000;
const APP_MODE = process.env.APP_MODE || 'production';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Modo: ${APP_MODE}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
