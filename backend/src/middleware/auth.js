const jwt = require('jsonwebtoken');
const USERS = require('../config/users');

const JWT_SECRET = process.env.JWT_SECRET || 'mall-secret-key-2024';

// 登录验证
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权，请登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token无效或已过期' });
  }
}

// 登录接口
function login(req, res) {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ token, user: { id: user.id, username: user.username } });
}

module.exports = { authenticate, login, JWT_SECRET };
