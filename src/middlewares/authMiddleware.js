const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

/**
 * Middleware de autenticação JWT com controle de acesso por cargo (role)
 * @param {string[]} roles - Lista de cargos permitidos (ex: ['admin', 'gestor'])
 * @returns {Function} middleware Express
 */
module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token ausente ou inválido" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Armazena usuário autenticado
      req.user = decoded;

      // Se roles forem definidas → checa autorização
      if (roles.length && !roles.includes(decoded.cargo)) {
        return res.status(403).json({ message: "Acesso negado: permissão insuficiente" });
      }

      // Opcional: verificar expiração manual (caso exp seja custom)
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ message: "Token expirado" });
      }

      // OK → segue fluxo
      next();
    } catch (error) {
      console.error("Erro JWT:", error.message);
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  };
};
