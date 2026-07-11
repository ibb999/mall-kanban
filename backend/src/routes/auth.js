const express = require('express');
const router = express.Router();
const { login } = require('../middleware/auth');

// 登录接口
router.post('/', login);

module.exports = router;
