const ExcelJS = require('exceljs');

async function exportEntryToExcel(entries) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('入场管控表');

  // 设置列宽
  worksheet.getColumn(1).width = 8;   // 序号
  worksheet.getColumn(2).width = 15;  // 店铺号
  worksheet.getColumn(3).width = 15;  // 开业日期
  for (let i = 4; i <= 24; i++) {
    worksheet.getColumn(i).width = 15;
  }

  // 第1行：标题
  worksheet.mergeCells('A1:W1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  titleRow.getCell(1).value = '商场商户入场管控表';
  titleRow.getCell(1).font = { size: 18, bold: true };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // 第2行：分组表头
  const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W'];
  const groups = [
    { name: '基础信息', cols: 3, color: { argb: 'FF3B82F6' } },
    { name: '费用与场地', cols: 2, color: { argb: 'FF3B82F6' } },
    { name: '商务服务', cols: 4, color: { argb: 'FF3B82F6' } },
    { name: '设计审核', cols: 1, color: { argb: 'FF8B5CF6' } },
    { name: '装修服务', cols: 5, color: { argb: 'FFF97316' } },
    { name: '开业服务', cols: 7, color: { argb: 'FF10B981' } },
    { name: '内容服务', cols: 1, color: { argb: 'FFEC4899' } },
  ];

  let startCol = 0;
  const row2 = worksheet.getRow(2);
  groups.forEach((group) => {
    const endCol = startCol + group.cols - 1;
    worksheet.mergeCells(`${colLetters[startCol]}2:${colLetters[endCol]}2`);
    const cell = row2.getCell(startCol + 1);
    cell.value = group.name;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: group.color };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    startCol += group.cols;
  });

  // 第3行：子表头
  const headers = ['序号', '店铺号', '开业日期', '费用收缴', '场地交接',
    '工商证照', '食药监申报', '食药监看场', '证照申领',
    '图纸审核',
    '装修验收表', '装修投保', '施工交底及手续办理', '施工进度', '施工验收执行',
    '营业员手续办理', '营业员交底', '开业申请', '喷绘清除', '档案流转', '装修押金退还', '开业活动',
    '内容素材采编'];
  
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  // 数据行
  entries.forEach((entry, idx) => {
    const rowData = [
      entry.serialNumber || (idx + 1),
      entry.storeNumber || '',
      entry.openingDate || '',
      entry.feeCollection || '未开始',
      entry.siteHandover || '未开始',
      entry.businessLicense || '未开始',
      entry.foodLicenseDeclaration || '未开始',
      entry.foodSiteVisit || '未开始',
      entry.licenseApplication || '未开始',
      entry.drawingReview || '未开始',
      entry.decorationAcceptance || '未开始',
      entry.decorationInsurance || '未开始',
      entry.constructionBriefing || '未开始',
      entry.constructionProgress || '未开始',
      entry.constructionAcceptance || '未开始',
      entry.staffProcessing || '未开始',
      entry.staffBriefing || '未开始',
      entry.openingApplication || '未开始',
      entry.paintingRemoval || '未开始',
      entry.archiveFlow || '未开始',
      entry.depositRefund || '未开始',
      entry.openingActivity || '未开始',
      entry.contentMaterial || '未开始',
    ];
    
    const dataRow = worksheet.addRow(rowData);
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataRow.height = 25;
    
    // 状态颜色
    rowData.forEach((val, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      if (typeof val === 'string' && ['未开始', '进行中', '已完成', '不适用'].includes(val)) {
        let fillColor = 'FFE5E5E5'; // 未开始-灰色
        if (val === '进行中') fillColor = 'FFBFDB'; // 浅蓝
        if (val === '已完成') fillColor = 'BBF7D0'; // 浅绿
        if (val === '不适用') fillColor = 'F3F4F6'; // 浅灰
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      }
    });
  });

  // 边框
  const range = worksheet.getRange('A1:W' + (entries.length + 3));
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  return workbook;
}

async function exportExitToExcel(records) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('撤场管控表');

  worksheet.getColumn(1).width = 8;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 20;
  for (let i = 4; i <= 17; i++) {
    worksheet.getColumn(i).width = 18;
  }

  // 标题
  worksheet.mergeCells('A1:Q1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  titleRow.getCell(1).value = '商场商户撤场管控表';
  titleRow.getCell(1).font = { size: 18, bold: true };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // 分组表头
  const groups = [
    { name: '基础信息', range: 'A2:C2', color: 'FF3B82F6' },
    { name: '店铺沟通', range: 'D2:D2', color: 'FF3B82F6' },
    { name: '喷绘围挡', range: 'E2:G2', color: 'FFF59E0B' },
    { name: '装修服务', range: 'H2:L2', color: 'FFF97316' },
    { name: '店铺交接', range: 'M2:M2', color: 'FF6366F1' },
    { name: '商务服务', range: 'N2:N2', color: 'FF3B82F6' },
    { name: '其他', range: 'O2:Q2', color: 'FF9CA3AF' },
  ];

  groups.forEach((group, idx) => {
    worksheet.mergeCells(group.range);
    const cell = titleRow.getCell(idx + 1);
    cell.value = group.name;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: group.color } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 子表头
  const headers = ['序号', '店铺号', '租户', '店铺沟通',
    '工作联系单', '费用收缴', '施工安排',
    '恢复界面交底', '装修验收表', '费用收缴', '施工交底及手续办理', '施工验收执行',
    '店铺交接',
    '工商证照注销',
    '退租赁保证金', '档案流转', '备注'];
  
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  // 数据行
  records.forEach((record, idx) => {
    const rowData = [
      record.serialNumber || (idx + 1),
      record.storeNumber || '',
      record.tenant || '',
      record.shopCommunication || '未开始',
      record.workOrder || '未开始',
      record.feeCollection1 || '未开始',
      record.constructionArrangement || '未开始',
      record.interfaceRestoration || '未开始',
      record.decorationAcceptance || '未开始',
      record.feeCollection2 || '未开始',
      record.constructionBriefing || '未开始',
      record.constructionAcceptance || '未开始',
      record.shopHandover || '未开始',
      record.businessLicenseCancellation || '未开始',
      record.depositRefund || '未开始',
      record.archiveFlow || '未开始',
      record.remarks || '',
    ];
    
    const dataRow = worksheet.addRow(rowData);
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataRow.height = 25;
    
    rowData.forEach((val, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      if (typeof val === 'string' && ['未开始', '进行中', '已完成', '不适用'].includes(val)) {
        let fillColor = 'FFE5E5E5';
        if (val === '进行中') fillColor = 'FFBFDB';
        if (val === '已完成') fillColor = 'BBF7D0';
        if (val === '不适用') fillColor = 'F3F4F6';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      }
    });
  });

  // 边框
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  return workbook;
}

module.exports = { exportEntryToExcel, exportExitToExcel };
