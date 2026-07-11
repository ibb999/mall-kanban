// 撤场管控表字段结构定义

const STATUS_OPTIONS = ['未开始', '进行中', '已完成', '不适用'];

// 撤场管控表分组结构（用于表头合并）
const GROUP_STRUCTURE = [
  {
    groupName: '基础信息',
    columns: [
      { key: 'serialNumber', label: '序号', type: 'text' },
      { key: 'storeNumber', label: '店铺号', type: 'text' },
      { key: 'tenant', label: '租户', type: 'text' },
    ]
  },
  {
    groupName: '店铺沟通',
    columns: [
      { key: 'shopCommunication', label: '店铺沟通', type: 'status' },
    ]
  },
  {
    groupName: '喷绘围挡',
    columns: [
      { key: 'workOrder', label: '工作联系单', type: 'status' },
      { key: 'feeCollection1', label: '费用收缴', type: 'status' },
      { key: 'constructionArrangement', label: '施工安排', type: 'status' },
    ]
  },
  {
    groupName: '装修服务',
    columns: [
      { key: 'interfaceRestoration', label: '恢复界面交底', type: 'status' },
      { key: 'decorationAcceptance', label: '装修验收表', type: 'status' },
      { key: 'feeCollection2', label: '费用收缴', type: 'status' },
      { key: 'constructionBriefing', label: '施工交底及手续办理', type: 'status' },
      { key: 'constructionAcceptance', label: '施工验收执行', type: 'status' },
    ]
  },
  {
    groupName: '店铺交接',
    columns: [
      { key: 'shopHandover', label: '店铺交接', type: 'status' },
    ]
  },
  {
    groupName: '商务服务',
    columns: [
      { key: 'businessLicenseCancellation', label: '工商证照注销', type: 'status' },
    ]
  },
  {
    groupName: '其他',
    columns: [
      { key: 'depositRefund', label: '退租赁保证金', type: 'status' },
      { key: 'archiveFlow', label: '档案流转', type: 'status' },
      { key: 'remarks', label: '备注', type: 'text' },
    ]
  },
];

// 撤场状态节点（严格按顺序）
const STATUS_NODES = [
  '撤场通知书下发',
  '撤场施工交底',
  '撤场施工',
  '撤场施工验收',
  '撤场交接',
  '撤场资料扫描件流转商务',
  '撤场资料存档',
  '证照注销',
];

// 撤场表日期字段（甘特图用）
const DATE_FIELDS = ['startDate', 'endDate'];

module.exports = {
  STATUS_OPTIONS,
  GROUP_STRUCTURE,
  STATUS_NODES,
  DATE_FIELDS,
  ALL_FIELDS: [
    'serialNumber',
    'storeNumber',
    'tenant',
    'shopCommunication',
    'workOrder',
    'feeCollection1',
    'constructionArrangement',
    'interfaceRestoration',
    'decorationAcceptance',
    'feeCollection2',
    'constructionBriefing',
    'constructionAcceptance',
    'shopHandover',
    'businessLicenseCancellation',
    'depositRefund',
    'archiveFlow',
    'remarks',
    'startDate',
    'endDate',
  ],
};
