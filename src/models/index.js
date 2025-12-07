const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Cliente = require('./cliente')(sequelize, Sequelize.DataTypes);
const Usuario = require('./usuario')(sequelize, Sequelize.DataTypes);
const Servico = require('./servico')(sequelize, Sequelize.DataTypes);
const Ativo = require('./ativo')(sequelize, Sequelize.DataTypes);
const Local = require('./local')(sequelize, Sequelize.DataTypes);
const TipoServico = require('./tiposervico')(sequelize, Sequelize.DataTypes);
const { attachCrudHooks } = require('../utils/auditLogger');

const models = { Cliente, Usuario, Servico, Ativo, Local, TipoServico }; 

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

Object.entries(models).forEach(([name, model]) => {
  attachCrudHooks(name, model);
});

const db = {
  sequelize,
  Sequelize,
  ...models
};

module.exports = db;
