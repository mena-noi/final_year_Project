const jwt = require('jsonwebtoken');

const generateToken = (userId, role, email) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env file');
  }
  return jwt.sign(
    { id: userId, role: role, email: email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };