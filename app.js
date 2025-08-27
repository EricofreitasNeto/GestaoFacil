require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { sequelize } = require('./src/models');




// Testar conexão com o banco de dados
sequelize.authenticate()
  .then(() => {
    console.log(' Conexão com o banco de dados estabelecida com sucesso.');
    return sequelize.sync({ force: false, logging: console.log });
  })
  .then(() => {
    console.log(' Tabelas sincronizadas com o banco de dados');
  })
  .catch(err => {
    console.error(' Erro ao conectar ou sincronizar com o banco de dados:', err);
  });