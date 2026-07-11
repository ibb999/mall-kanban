const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const store = require('../models/store');
const entryDef = require('../config/entryFields');

// 获取所有入场记录
router.get('/entry', authenticate, async (req, res) => {
  try {
    const data = await store.getAll('entry');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出入场管控表Excel
router.get('/entry/export', authenticate, async (req, res) => {
  try {
    const entries = await store.getAll('entry');
    const workbook = await (require('../export/excelExporter')).exportEntryToExcel(entries);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=入场管控表.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: '导出失败', message: err.message });
  }
});

// 创建入场记录
router.post('/entry', authenticate, async (req, res) => {
  try {
    const { storeNumber, ...rest } = req.body;
    if (!storeNumber) {
      return res.status(400).json({ error: '店铺号不能为空' });
    }
    
    // 初始化状态字段
    entryDef.ENTRY_FIELDS.forEach(field => {
      if (!rest[field]) {
        rest[field] = field === 'storeNumber' || field === 'serialNumber' || field === 'openingDate' ? '' : '未开始';
      }
    });
    
    const record = await store.create('entry', { ...rest, storeNumber });
    
    // 记录操作日志
    await store.addOperationLog({
      operator: req.user.username,
      table: 'entry',
      storeNumber,
      field: 'create',
      oldValue: '',
      newValue: '新建记录',
      actionTime: new Date().toISOString(),
    });
    
    // 广播实时更新
    const io = req.app.get('io');
    if (io) io.emit('entry:update', record);
    
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新入场记录单个字段
router.patch('/entry/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    
    if (!field || value === undefined) {
      return res.status(400).json({ error: '请提供字段名和值' });
    }
    
    const record = await store.findById('entry', id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const oldValue = record[field];
    const updated = await store.updateById('entry', id, { [field]: value });
    
    await store.addOperationLog({
      operator: req.user.username,
      table: 'entry',
      storeNumber: record.storeNumber,
      field,
      oldValue,
      newValue: value,
      actionTime: new Date().toISOString(),
    });
    
    const io = req.app.get('io');
    if (io) io.emit('entry:update', updated);
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除入场记录
router.delete('/entry/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const record = await store.findById('entry', id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    await store.deleteById('entry', id);
    
    await store.addOperationLog({
      operator: req.user.username,
      table: 'entry',
      storeNumber: record.storeNumber,
      field: 'delete',
      oldValue: '存在',
      newValue: '已删除',
      actionTime: new Date().toISOString(),
    });
    
    const io = req.app.get('io');
    if (io) io.emit('entry:deleted', id);
    
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
