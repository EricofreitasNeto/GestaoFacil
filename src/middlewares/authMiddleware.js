const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token inválido ou ausente' });
    }

    const [, token] = authHeader.split(' '); // Formato: Bearer <token>

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Payload do token:', decoded);

      // Verifica cargo se roles forem definidos
      if (roles.length && !roles.includes(decoded.cargo)) {
        return res.status(403).json({ message: 'Acesso negado: cargo insuficiente' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };
};