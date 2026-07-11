const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const store = require('../models/store');

// 获取操作日志
router.get('/', authenticate, async (req, res) => {
  try {
    const logs = await store.getAll('operationLog');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: '获取日志失败', message: err.message });
  }
});

module.exports = router;
