const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const store = require('../models/store');

const exitDef = require('../config/exitFields');

// 获取所有撤场记录
router.get('/exitStore', authenticate, async (req, res) => {
  try {
    const data = await store.getAll('exitStore');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出撤场管控表Excel
router.get('/exitStore/export', authenticate, async (req, res) => {
  try {
    const records = await store.getAll('exitStore');
    const workbook = await (require('../export/exitExporter')).exportExitToExcel(records);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=撤场管控表.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: '导出失败', message: err.message });
  }
});

// 创建撤场记录
router.post('/exitStore', authenticate, async (req, res) => {
  try {
    const { storeNumber, ...rest } = req.body;
    if (!storeNumber) {
      return res.status(400).json({ error: '店铺号不能为空' });
    }
    
    exitDef.EXIT_FIELDS.forEach(field => {
      if (!rest[field]) {
        rest[field] = field === 'serialNumber' || field === 'storeNumber' || field === 'tenant' ? '' : '未开始';
      }
    });
    
    const record = await store.create('exitStore', { ...rest, storeNumber });
    
    await store.addOperationLog({
      operator: req.user.username,
      table: 'exitStore',
      storeNumber,
      field: 'create',
      oldValue: '',
      newValue: '新建记录',
      actionTime: new Date().toISOString(),
    });
    
    const io = req.app.get('io');
    if (io) io.emit('exitStore:update', record);
    
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新撤场记录单个字段
router.patch('/exitStore/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    
    if (!field || value === undefined) {
      return res.status(400).json({ error: '请提供字段名和值' });
    }
    
    const record = await store.findById('exitStore', id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const oldValue = record[field];
    const updated = await store.updateById('exitStore', id, { [field]: value });
    
    await store.addOperationLog({
      operator: req.user.username,
      table: 'exitStore',
      storeNumber: record.storeNumber,
      field,
      oldValue,
      newValue: value,
      actionTime: new Date().toISOString(),
    });
    
    const io = req.app.get('io');
    if (io) io.emit('exitStore:update', updated);
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除撤场记录
router.delete('/exitStore/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const record = await store.findById('exitStore', id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    await store.deleteById('exitStore', id);
    
    await store.addOperationLog({
      operator: req.user.username,
      table: 'exitStore',
      storeNumber: record.storeNumber,
      field: 'delete',
      oldValue: '存在',
      newValue: '已删除',
      actionTime: new Date().toISOString(),
    });
    
    const io = req.app.get('io');
    if (io) io.emit('exitStore:deleted', id);
    
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
