const API_BASE = 'http://localhost:3001/api';

// 通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// 任务 API
export const tasksApi = {
  // 获取所有任务
  getAll: () => request('/tasks'),

  // 获取单个任务
  getById: (id) => request(`/tasks/${id}`),

  // 创建任务
  create: (data) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新任务
  update: (id, data) => request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除任务
  delete: (id) => request(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// 打卡记录 API
export const checkinsApi = {
  // 获取指定日期的打卡记录
  getByDate: (date) => request(`/checkins?date=${date}`),

  // 获取指定月份的打卡记录
  getByMonth: (month) => request(`/checkins?month=${month}`),

  // 获取所有打卡记录
  getAll: () => request('/checkins'),

  // 获取单条记录
  getById: (id) => request(`/checkins/${id}`),

  // 新增打卡
  create: (data) => request('/checkins', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 删除打卡记录
  delete: (id) => request(`/checkins/${id}`, {
    method: 'DELETE',
  }),
};

// 统计 API
export const statsApi = {
  // 获取统计数据
  get: () => request('/stats'),
};

// 工具函数：获取今天的日期字符串 YYYY-MM-DD
export const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

// 工具函数：获取当前月份字符串 YYYY-MM
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};
