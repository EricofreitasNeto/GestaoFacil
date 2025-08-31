const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./src/models'); // importa os modelos e conecta Sequelize
const app = express();
// Configuração básica de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// Limitar requisições para evitar ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Logs de requisições em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configuração do body parser com limite aumentado para uploads
app.use(bodyParser.json({
  limit: '10mb',
  extended: true
}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));

// Importa rotas
const clienteRoutes = require('./src/routes/clienteRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const servicoRoutes = require('./src/routes/servicoRoutes');
const ativoRoutes = require('./src/routes/ativoRoutes');
const localRoutes = require('./src/routes/localRoutes');
const tipoServicoRoutes = require('./src/routes/tipoServicoRoutes');



// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Teste de conexão com o banco
db.sequelize.authenticate()
  .then(() => console.log(' Conectado ao banco de dados'))
  .catch(err => console.error(' Erro ao conectar ao banco:', err));

// Sincroniza os modelos (opcional: { force: true } para recriar tabelas)
db.sequelize.sync()
  .then(() => console.log(' Modelos sincronizados'))
  .catch(err => console.error(' Erro ao sincronizar modelos:', err));

// Rotas
const apiRouter = express.Router();
const authenticateJWT = require('./src/middlewares/authMiddleware');
apiRouter.use('/clientes',authenticateJWT, clienteRoutes);
apiRouter.use('/usuarios',authenticateJWT, usuarioRoutes);
apiRouter.use('/servicos',authenticateJWT, servicoRoutes);
apiRouter.use('/ativos',authenticateJWT, ativoRoutes);
apiRouter.use('/locais',authenticateJWT, localRoutes);
apiRouter.use('/tiposervico', tipoServicoRoutes);
app.use('/v1', apiRouter);


// Rota raiz
app.get('/', (req, res) => {
  res.send(' API Gestão Fácil rodando com sucesso!');
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});