const ExcelJS = require('exceljs');

async function exportExitToExcel(records) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('撤场管控表');

  // 列定义与宽度
  const columns = [
    { key: 'serialNumber', width: 8, label: '序号' },
    { key: 'storeNumber', width: 12, label: '店铺号' },
    { key: 'tenant', width: 20, label: '租户' },
    { key: 'shopCommunication', width: 15, label: '店铺沟通' },
    { key: 'workOrder', width: 15, label: '工作联系单' },
    { key: 'feeCollection1', width: 15, label: '费用收缴' },
    { key: 'constructionArrangement', width: 15, label: '施工安排' },
    { key: 'interfaceRestoration', width: 15, label: '恢复界面交底' },
    { key: 'decorationAcceptance', width: 15, label: '装修验收表' },
    { key: 'feeCollection2', width: 15, label: '费用收缴' },
    { key: 'constructionBriefing', width: 15, label: '施工交底及手续办理' },
    { key: 'constructionAcceptance', width: 15, label: '施工验收执行' },
    { key: 'shopHandover', width: 15, label: '店铺交接' },
    { key: 'businessLicenseCancellation', width: 15, label: '工商证照注销' },
    { key: 'depositRefund', width: 15, label: '退租赁保证金' },
    { key: 'archiveFlow', width: 15, label: '档案流转' },
    { key: 'remarks', width: 20, label: '备注' },
  ];

  // 第1行：标题
  worksheet.mergeCells('A1:Q1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  titleRow.getCell(1).value = '商场商户撤场管控表';
  titleRow.getCell(1).font = { size: 18, bold: true };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // 第2行：分组表头
  const groups = [
    { name: '基础信息', cols: 3, color: { argb: 'FF3B82F6' } },
    { name: '店铺沟通', cols: 1, color: { argb: 'FF3B82F6' } },
    { name: '喷绘围挡', cols: 3, color: { argb: 'FFF59E0B' } },
    { name: '装修服务', cols: 5, color: { argb: 'FFF97316' } },
    { name: '店铺交接', cols: 1, color: { argb: 'FF6366F1' } },
    { name: '商务服务', cols: 1, color: { argb: 'FF3B82F6' } },
    { name: '其他', cols: 3, color: { argb: 'FF9CA3AF' } },
  ];

  let colIdx = 0;
  const headerRow2 = worksheet.getRow(2);
  groups.forEach((group) => {
    const startCol = colIdx + 1;
    const endCol = colIdx + group.cols;
    const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q'];
    worksheet.mergeCells(`${colLetters[startCol-1]}2:${colLetters[endCol-1]}2`);
    
    const cell = headerRow2.getCell(startCol);
    cell.value = group.name;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: group.color };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    colIdx += group.cols;
  });

  // 第3行：子表头
  const headers = columns.map(c => c.label);
  worksheet.addRow(headers);
  const headerRow3 = worksheet.getLastRow();
  headerRow3.font = { bold: true, size: 10 };
  headerRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } };
  headerRow3.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow3.height = 30;

  // 数据行
  const statusOptions = ['未开始', '进行中', '已完成', '不适用'];
  const statusColors = {
    '未开始': 'FFE5E5E5',
    '进行中': 'FFBFDB',
    '已完成': 'FFBBF7D0',
    '不适用': 'FFF3F4F6',
  };

  records.forEach((record, idx) => {
    const rowData = columns.map(col => {
      if (col.key === 'serialNumber') return idx + 1;
      const val = record[col.key] || '';
      return statusOptions.includes(val) ? val : (typeof val === 'string' ? val : '');
    });

    const dataRow = worksheet.addRow(rowData);
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataRow.height = 25;

    // 添加边框和状态颜色
    dataRow.eachCell((cell, colNum) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
      if (statusOptions.includes(cell.value)) {
        const color = statusColors[cell.value] || 'FFE5E5E5';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      }
    });
  });

  return workbook;
}

module.exports = { exportExitToExcel };
