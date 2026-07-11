const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { exportEntryToExcel } = require('../export/excelExporter');
const { exportExitToExcel } = require('../export/exitExporter');
const store = require('../models/store');

// 导出入场管控表Excel
router.get('/export-entry', authenticate, async (req, res) => {
  try {
    const entries = store.getAll('entry');
    const workbook = await exportEntryToExcel(entries);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=入场管控表.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: '导出失败', message: err.message });
  }
});

// 导出撤场管控表Excel
router.get('/export-exitStore', authenticate, async (req, res) => {
  try {
    const records = store.getAll('exitStore');
    const workbook = await exportExitToExcel(records);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=撤场管控表.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: '导出失败', message: err.message });
  }
});

// 同时导出两个表
router.get('/export-all', authenticate, async (req, res) => {
  try {
    const entries = store.getAll('entry');
    const records = store.getAll('exitStore');
    
    const workbook = new (require('exceljs'))();
    
    // 添加入场管控表sheet
    const entryWorkbook = await exportEntryToExcel(entries);
    const entrySheet = entryWorkbook.getWorksheet(1);
    const newSheet = workbook.addWorksheet('入场管控表');
    entrySheet.eachRow(function(row, rowNumber) {
      newSheet.addRow(row.values);
    });
    
    // 添加撤场管控表sheet
    const exitWorkbook = await exportExitToExcel(records);
    const exitSheet = exitWorkbook.getWorksheet(1);
    const newSheet2 = workbook.addWorksheet('撤场管控表');
    exitSheet.eachRow(function(row, rowNumber) {
      newSheet2.addRow(row.values);
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=商场商户管理全部数据.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: '导出失败', message: err.message });
  }
});

module.exports = router;
