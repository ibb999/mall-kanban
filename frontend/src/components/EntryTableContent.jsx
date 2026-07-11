import React, { useState } from 'react';
import { api } from '../services/api';

// 入场管控表的分组结构
const GROUP_STRUCTURE = [
  {
    groupName: '基础信息',
    columns: [
      { key: 'serialNumber', label: '序号', type: 'text' },
      { key: 'storeNumber', label: '店铺号', type: 'text' },
      { key: 'openingDate', label: '开业日期', type: 'text' },
    ]
  },
  {
    groupName: '费用与场地',
    columns: [
      { key: 'feeCollection', label: '费用收缴', type: 'status' },
      { key: 'siteHandover', label: '场地交接', type: 'status' },
    ]
  },
  {
    groupName: '商务服务',
    columns: [
      { key: 'businessLicense', label: '工商证照', type: 'status' },
      { key: 'foodLicenseDeclaration', label: '食药监申报', type: 'status' },
      { key: 'foodSiteVisit', label: '食药监看场', type: 'status' },
      { key: 'licenseApplication', label: '证照申领', type: 'status' },
    ]
  },
  {
    groupName: '设计审核',
    columns: [
      { key: 'drawingReview', label: '图纸审核', type: 'status' },
    ]
  },
  {
    groupName: '装修服务',
    columns: [
      { key: 'decorationAcceptance', label: '装修验收表', type: 'status' },
      { key: 'decorationInsurance', label: '装修投保', type: 'status' },
      { key: 'constructionBriefing', label: '施工交底及手续办理', type: 'status' },
      { key: 'constructionProgress', label: '施工进度', type: 'status' },
      { key: 'constructionAcceptance', label: '施工验收执行', type: 'status' },
    ]
  },
  {
    groupName: '开业服务',
    columns: [
      { key: 'staffProcessing', label: '营业员手续办理', type: 'status' },
      { key: 'staffBriefing', label: '营业员交底', type: 'status' },
      { key: 'openingApplication', label: '开业申请', type: 'status' },
      { key: 'paintingRemoval', label: '喷绘清除', type: 'status' },
      { key: 'archiveFlow', label: '档案流转', type: 'status' },
      { key: 'depositRefund', label: '装修押金退还', type: 'status' },
      { key: 'openingActivity', label: '开业活动', type: 'status' },
    ]
  },
  {
    groupName: '内容服务',
    columns: [
      { key: 'contentMaterial', label: '内容素材采编', type: 'status' },
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

function CellEditor({ value, type, onChange, record, field, setEntries }) {
  if (type === 'text') {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          const newVal = e.target.value;
          onChange(newVal);
          updateField(record.id, field, newVal, setEntries);
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
          updateField(record.id, field, newVal, setEntries);
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

function updateField(id, field, value, setEntries) {
  api.patch(`/entry/${id}`, { field, value })
    .then(response => {
      setEntries(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    })
    .catch(err => console.error('Update failed:', err));
}

function EntryTableContent({ entries, setEntries }) {
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
                                   idx === 2 ? '#3B82F6' :
                                   idx === 3 ? '#8B5CF6' :
                                   idx === 4 ? '#F97316' :
                                   idx === 5 ? '#10B981' : '#EC4899'
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
          {entries.map((record) => (
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
                          setEntries={setEntries}
                        />
                      ) : (
                        <CellEditor
                          value={value}
                          type={col.type}
                          onChange={(val) => handleCellChange(record.id, col.key, val, col.type)}
                          record={record}
                          field={col.key}
                          setEntries={setEntries}
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
                      api.delete(`/entry/${record.id}`)
                        .then(() => setEntries(prev => prev.filter(e => e.id !== record.id)));
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={GROUP_STRUCTURE.reduce((sum, g) => sum + g.columns.length, 0) + 1} className="px-3 py-8 text-center text-gray-500">
                暂无数据，请点击"新增入场记录"添加
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EntryTableContent;
