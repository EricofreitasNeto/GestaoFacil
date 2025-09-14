const app = require('./app');
import http from 'node:http';
module.exports = (req, res) => {
  app(req, res);
};

