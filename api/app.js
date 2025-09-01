const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./src/models');

const app = express();

//Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

//Body parsers com limite para uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Limite de requisições por IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

//Logs em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Log personalizado detalhado
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

//Importa rotas
const authenticateJWT = require('./src/middlewares/authMiddleware');
const clienteRoutes = require('./src/routes/clienteRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const servicoRoutes = require('./src/routes/servicoRoutes');
const ativoRoutes = require('./src/routes/ativoRoutes');
const localRoutes = require('./src/routes/localRoutes');
const tipoServicoRoutes = require('./src/routes/tipoServicoRoutes');
const authRoutes = require('./src/routes/authRoutes');

//Rotas públicas
app.use('/auth', authRoutes);

//Rotas protegidas
const apiRouter = express.Router();
apiRouter.use('/clientes', authenticateJWT(), clienteRoutes);
apiRouter.use('/usuarios', authenticateJWT(), usuarioRoutes);
apiRouter.use('/servicos', authenticateJWT(), servicoRoutes);
apiRouter.use('/ativos', authenticateJWT(), ativoRoutes);
apiRouter.use('/locais', authenticateJWT(), localRoutes);
apiRouter.use('/tiposervico', authenticateJWT(), tipoServicoRoutes);
app.use('/v1', apiRouter);

console.log("DATABASE_URL:", process.env.DATABASE_URL);

//Teste de conexão com o banco
db.sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

//Sincroniza os modelos
db.sequelize.sync()
  .then(() => console.log('🔄 Modelos sincronizados'))
  .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));

//Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API Gestão Fácil rodando com sucesso!');
});

//Inicia servidor
const PORT = process.env.PORT || 3000;
module.exports = app;
