const jwt = require('jsonwebtoken'); 
const { JWT_SECRET } = process.env; 
module.exports = (req, res, next) => { 
const authHeader = req.headers.authorization; 

if (!authHeader) return res.status(401).json({ message: 'Token inválido ou ausente',authHeader }); 
const [,token] = authHeader.split(' '); // Formato: Bearer <token> 
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Payload do token:', decoded); // Isso vai mostrar o conteúdo no terminal
  req.user = decoded;
  next();
} catch (error) {
  res.status(401).json({ message: 'Token inválido ou ausente' });
}

}; 