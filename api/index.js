const app = require('./app');
require('dotenv').config();

if (process.env.APP_MODE === 'local') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🟢 Rodando localmente em http://localhost:${PORT}`);
  });
} else {
  console.log('🚀 Rodando em modo serverless (Vercel)');
}
module.exports = (req, res) => {
  app(req, res);
};

