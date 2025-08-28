const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./src/models'); // importa os modelos e conecta Sequelize

// Importa rotas
const clienteRoutes = require('./src/routes/clienteRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const servicoRoutes = require('./src/routes/servicoRoutes');
const ativoRoutes = require('./src/routes/ativoRoutes');
const localRoutes = require('./src/routes/localRoutes');
const tipoServicoRoutes = require('./src/routes/tipoServicoRoutes');

const app = express();

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
app.use('/clientes', clienteRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/servicos', servicoRoutes);
app.use('/ativos', ativoRoutes);
app.use('/locais', localRoutes);
app.use('/tiposervico', tipoServicoRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send(' API Gestão Fácil rodando com sucesso!');
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});