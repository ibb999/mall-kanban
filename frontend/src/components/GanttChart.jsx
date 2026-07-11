import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// 入场甘特图颜色配置
const ENTRY_COLORS = {
  '基础信息': '#6B7280',
  '费用与场地': '#3B82F6',
  '商务服务': '#3B82F6',
  '设计审核': '#8B5CF6',
  '装修服务': '#F97316',
  '开业服务': '#10B981',
  '内容服务': '#EC4899',
};

// 撤场甘特图颜色配置
const EXIT_COLORS = {
  '基础信息': '#6B7280',
  '店铺沟通': '#3B82F6',
  '喷绘围挡': '#F59E0B',
  '装修服务': '#F97316',
  '店铺交接': '#6366F1',
  '商务服务': '#3B82F6',
  '其他': '#9CA3AF',
};

// 入场表任务分组定义
const ENTRY_GROUPS = [
  {
    name: '基础信息',
    fields: ['serialNumber', 'storeNumber', 'openingDate'],
  },
  {
    name: '费用与场地',
    fields: ['feeCollection', 'siteHandover'],
  },
  {
    name: '商务服务',
    fields: ['businessLicense', 'foodLicenseDeclaration', 'foodSiteVisit', 'licenseApplication'],
  },
  {
    name: '设计审核',
    fields: ['drawingReview'],
  },
  {
    name: '装修服务',
    fields: ['decorationAcceptance', 'decorationInsurance', 'constructionBriefing', 'constructionProgress', 'constructionAcceptance'],
  },
  {
    name: '开业服务',
    fields: ['staffProcessing', 'staffBriefing', 'openingApplication', 'paintingRemoval', 'archiveFlow', 'depositRefund', 'openingActivity'],
  },
  {
    name: '内容服务',
    fields: ['contentMaterial'],
  },
];

// 撤场表任务分组定义
const EXIT_GROUPS = [
  {
    name: '基础信息',
    fields: ['serialNumber', 'storeNumber', 'tenant'],
  },
  {
    name: '店铺沟通',
    fields: ['shopCommunication'],
  },
  {
    name: '喷绘围挡',
    fields: ['workOrder', 'feeCollection1', 'constructionArrangement'],
  },
  {
    name: '装修服务',
    fields: ['interfaceRestoration', 'decorationAcceptance', 'feeCollection2', 'constructionBriefing', 'constructionAcceptance'],
  },
  {
    name: '店铺交接',
    fields: ['shopHandover'],
  },
  {
    name: '商务服务',
    fields: ['businessLicenseCancellation'],
  },
  {
    name: '其他',
    fields: ['depositRefund', 'archiveFlow', 'remarks'],
  },
];

// 甘特条组件
function GanttBar({ startTime, endTime, color }) {
  if (!startTime || !endTime) return null;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  
  // 计算时间范围
  const minDate = new Date(Math.min(start, end, now));
  const maxDate = new Date(Math.max(start, end, now));
  const totalRange = maxDate - minDate;
  
  if (totalRange === 0) return null;
  
  const leftPercent = ((now - minDate) / totalRange) * 100;
  const widthPercent = Math.max(((end - start) / totalRange) * 100, 2);
  
  const isPast = end < now;
  const isInProgress = start <= now && end >= now;
  const isFuture = start > now;
  
  let bgColor = color || '#3B82F6';
  if (isPast) bgColor = adjustOpacity(color, 0.5);
  if (isInProgress) bgColor = color;
  if (isFuture) bgColor = adjustOpacity(color, 0.3);
  
  return (
    <div style={{ position: 'relative', height: 24, marginTop: 2, marginBottom: 2 }}>
      <div
        style={{
          position: 'absolute',
          left: `${Math.max(0, Math.min(leftPercent, 100))}%`,
          width: `${widthPercent}%`,
          height: 20,
          backgroundColor: bgColor,
          borderRadius: 4,
          top: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 4px',
        }}
      >
        {start.toLocaleDateString().slice(0, -1)} 至 {end.toLocaleDateString().slice(0, -1)}
      </div>
    </div>
  );
}

// 辅助函数：调整透明度
function adjustOpacity(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 甘特图行组件
function GanttRow({ record, group, color, tableType, setRecordsOrEntries }) {
  const [isEditing, setIsEditing] = useState(null); // 当前正在编辑的字段
  const [editValue, setEditValue] = useState({ start: '', end: '' });
  
  const fields = group.fields.filter(f => f !== 'serialNumber' && f !== 'storeNumber' && f !== 'tenant' && f !== 'openingDate' && f !== 'remarks');
  
  const handleEdit = (field) => {
    const value = record[field] || '';
    const parts = value.split(' 至 ');
    setIsEditing(field);
    setEditValue({
      start: parts.length > 0 ? parts[0] : '',
      end: parts.length > 1 ? parts[1] : '',
    });
  };
  
  const handleSave = async (field) => {
    const newValue = `${editValue.start} 至 ${editValue.end}`;
    const apiUrl = tableType === 'entry' ? `/entry/${record.id}` : `/exitStore/${record.id}`;
    
    try {
      await api.patch(apiUrl, { field, value: newValue });
      setRecordsOrEntries(prev =>
        prev.map(item => item.id === record.id ? { ...item, [field]: newValue } : item)
      );
      setIsEditing(null);
    } catch (err) {
      console.error('Failed to update dates:', err);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(null);
  };

  // 文本型字段（如序号）
  const textFields = group.fields.filter(f => !['serialNumber', 'storeNumber', 'tenant', 'openingDate', 'remarks'].includes(f) || group.fields.includes(f));
  const isTextField = (f) => ['serialNumber', 'storeNumber', 'tenant', 'openingDate', 'remarks'].includes(f);
  const statusFields = fields;
  
  return (
    <div className="mb-3 pb-3 border-b last:border-b-0">
      <div className="flex items-center mb-1">
        <span
          className="inline-block w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-sm text-gray-700">{group.name}</span>
        <span className="text-xs text-gray-400 ml-2">（{fields.length}个子任务）</span>
      </div>
      
      <div className="ml-4">
        {fields.map((field) => {
          const value = record[field] || '';
          const parts = value.split(' 至 ');
          const startTime = parts[0] || '';
          const endTime = parts[1] || '';
          
          return (
            <div key={field} className="flex items-center mb-1">
              <span className="text-xs text-gray-600 w-24 truncate">{field}</span>
              
              {isEditing === field ? (
                <div className="flex items-center space-x-1 flex-1">
                  <input
                    type="date"
                    value={editValue.start}
                    onChange={(e) => setEditValue(prev => ({ ...prev, start: e.target.value }))}
                    className="border rounded px-1 py-0.5 text-xs w-32"
                  />
                  <span className="text-xs text-gray-500">至</span>
                  <input
                    type="date"
                    value={editValue.end}
                    onChange={(e) => setEditValue(prev => ({ ...prev, end: e.target.value }))}
                    className="border rounded px-1 py-0.5 text-xs w-32"
                  />
                  <button
                    onClick={() => handleSave(field)}
                    className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <div
                    onClick={() => handleEdit(field)}
                    className="cursor-pointer px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-xs"
                  >
                    {startTime && endTime ? `${startTime} 至 ${endTime}` : '点击填写日期'}
                  </div>
                  {(startTime || endTime) && (
                    <GanttBar startTime={startTime} endTime={endTime} color={color} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 甘特图主组件
function GanttChart({ data, colorMap, groups, colorConfigMap, title, tableType, setData }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {data.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-8">暂无数据</div>
      )}
      {data.map(record => (
        <div key={record.id} className="mb-4 pb-4 last:pb-0 border-b last:border-b-0">
          <div className="font-bold text-base text-gray-900 mb-2">
            🏪 {record.storeNumber || '未命名'}
          </div>
          
          {groups.map(group => {
            const color = colorConfigMap?.[group.name] || colorMap?.[group.name] || '#6B7280';
            return (
              <GanttRow
                key={group.name}
                record={record}
                group={group}
                color={color}
                tableType={tableType}
                setRecordsOrEntries={setData}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 甘特图视图（页面级别组件）
function GanttViewPage() {
  const [entryData, setEntryData] = useState([]);
  const [exitData, setExitData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entryRes, exitRes] = await Promise.all([
        api.get('/entry'),
        api.get('/exitStore'),
      ]);
      setEntryData(entryRes.data || []);
      setExitData(exitRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 甘特图</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GanttChart
            data={entryData}
            colorMap={ENTRY_COLORS}
            colorConfigMap={ENTRY_COLORS}
            groups={ENTRY_GROUPS}
            title="入场管控甘特图"
            tableType="entry"
            setData={setEntryData}
          />
          <GanttChart
            data={exitData}
            colorMap={EXIT_COLORS}
            colorConfigMap={EXIT_COLORS}
            groups={EXIT_GROUPS}
            title="撤场管控甘特图"
            tableType="exitStore"
            setData={setExitData}
          />
        </div>
      </div>
    </div>
  );
}

export default GanttViewPage;
