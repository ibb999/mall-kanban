import React, { useState } from 'react';
import { api } from '../services/api';

// 撤场管控表的分组结构
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

const STATUS_OPTIONS = ['未开始', '进行中', '已完成', '不适用'];
const STATUS_COLORS = {
  '未开始': 'bg-gray-200 text-gray-700',
  '进行中': 'bg-blue-200 text-blue-800',
  '已完成': 'bg-green-200 text-green-800',
  '不适用': 'bg-gray-100 text-gray-500',
};

function StatusTag({ value }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[value] || STATUS_COLORS['未开始']}`}>
      {value}
    </span>
  );
}

function CellEditor({ value, type, onChange, record, field, setRecords }) {
  if (type === 'text') {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          const newVal = e.target.value;
          onChange(newVal);
          updateField(record.id, field, newVal, setRecords);
        }}
        className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded text-sm"
      />
    );
  }

  if (type === 'status') {
    return (
      <select
        value={value || '未开始'}
        onChange={(e) => {
          const newVal = e.target.value;
          onChange(newVal);
          updateField(record.id, field, newVal, setRecords);
        }}
        className={`px-2 py-1 rounded text-xs font-medium border-0 ${STATUS_COLORS[value] || STATUS_COLORS['未开始']}`}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return <span>{value}</span>;
}

function updateField(id, field, value, setRecords) {
  api.patch(`/exitStore/${id}`, { field, value })
    .then(response => {
      setRecords(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    })
    .catch(err => console.error('Update failed:', err));
}

function ExitTableContent({ records, setRecords }) {
  const [cellValues, setCellValues] = useState({});

  const handleCellChange = (id, field, value, type) => {
    setCellValues(prev => ({
      ...prev,
      [`${id}-${field}`]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {/* 分组表头 */}
          <tr>
            {GROUP_STRUCTURE.map((group, idx) => (
              <th
                key={group.groupName}
                colSpan={group.columns.length}
                className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider"
                style={{
                  backgroundColor: idx === 0 ? '#3B82F6' : 
                                   idx === 1 ? '#3B82F6' :
                                   idx === 2 ? '#F59E0B' :
                                   idx === 3 ? '#F97316' :
                                   idx === 4 ? '#6366F1' :
                                   idx === 5 ? '#3B82F6' : '#9CA3AF'
                }}
              >
                {group.groupName}
              </th>
            ))}
          </tr>
          {/* 子表头 */}
          <tr>
            {GROUP_STRUCTURE.flatMap(group => group.columns.map(col => (
              <th
                key={col.key}
                className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-t-2 border-gray-300"
              >
                {col.label}
              </th>
            )))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              {GROUP_STRUCTURE.flatMap(group => 
                group.columns.map(col => {
                  const value = cellValues[`${record.id}-${col.key}`] || record[col.key] || '';
                  return (
                    <td key={col.key} className="px-3 py-3 text-sm">
                      {col.type === 'status' ? (
                        <CellEditor
                          value={value}
                          type="status"
                          onChange={(val) => handleCellChange(record.id, col.key, val, col.type)}
                          record={record}
                          field={col.key}
                          setRecords={setRecords}
                        />
                      ) : (
                        <CellEditor
                          value={value}
                          type={col.type}
                          onChange={(val) => handleCellChange(record.id, col.key, val, col.type)}
                          record={record}
                          field={col.key}
                          setRecords={setRecords}
                        />
                      )}
                    </td>
                  );
                })
              )}
              <td className="px-3 py-3 text-sm text-right">
                <button
                  onClick={() => {
                    if (window.confirm('确定要删除这条记录吗？')) {
                      api.delete(`/exitStore/${record.id}`)
                        .then(() => setRecords(prev => prev.filter(r => r.id !== record.id)));
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={GROUP_STRUCTURE.reduce((sum, g) => sum + g.columns.length, 0) + 1} className="px-3 py-8 text-center text-gray-500">
                暂无数据，请点击"新增撤场记录"添加
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExitTableContent;
