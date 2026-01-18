/**
 * API 请求封装 - 微信小程序版本
 * 对应 React 版本的 src/api.js
 */

const app = getApp();

/**
 * 通用请求函数
 * @param {string} endpoint - API 端点
 * @param {object} options - 请求选项
 * @returns {Promise}
 */
const request = (endpoint, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = `${app.globalData.apiBase}${endpoint}`;

    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const error = new Error(res.data.error || '请求失败');
          error.statusCode = res.statusCode;
          reject(error);
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
};

/**
 * 任务 API
 */
const tasksApi = {
  // 获取所有任务
  getAll() {
    return request('/tasks');
  },

  // 获取单个任务
  getById(id) {
    return request(`/tasks/${id}`);
  },

  // 创建任务
  create(data) {
    return request('/tasks', {
      method: 'POST',
      data
    });
  },

  // 更新任务
  update(id, data) {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      data
    });
  },

  // 删除任务
  delete(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * 打卡记录 API
 */
const checkinsApi = {
  // 获取指定日期的打卡记录
  getByDate(date) {
    return request(`/checkins?date=${date}`);
  },

  // 获取指定月份的打卡记录
  getByMonth(month) {
    return request(`/checkins?month=${month}`);
  },

  // 获取所有打卡记录
  getAll() {
    return request('/checkins');
  },

  // 获取单条记录
  getById(id) {
    return request(`/checkins/${id}`);
  },

  // 新增打卡
  create(data) {
    return request('/checkins', {
      method: 'POST',
      data
    });
  },

  // 删除打卡记录
  delete(id) {
    return request(`/checkins/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * 统计 API
 */
const statsApi = {
  // 获取统计数据
  get() {
    return request('/stats');
  }
};

/**
 * LLM API
 */
const llmApi = {
  // 同步聊天
  chat(messages, systemPrompt) {
    return request('/llm/chat', {
      method: 'POST',
      data: {
        messages,
        systemPrompt,
        mode: 'sync'
      }
    });
  },

  // 异步聊天（轮询模式）
  chatAsync(messages, systemPrompt) {
    return request('/llm/chat', {
      method: 'POST',
      data: {
        messages,
        systemPrompt,
        mode: 'poll'
      }
    });
  },

  // 获取任务结果
  getTask(taskId) {
    return request(`/llm/task/${taskId}`);
  }
};

/**
 * 工具函数：获取今天的日期字符串 YYYY-MM-DD
 */
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 工具函数：获取当前月份字符串 YYYY-MM
 */
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 工具函数：格式化日期
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * 工具函数：获取星期几（中文）
 */
const getWeekDay = (date) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(date);
  return `周${weekDays[d.getDay()]}`;
};

module.exports = {
  request,
  tasksApi,
  checkinsApi,
  statsApi,
  llmApi,
  getTodayDate,
  getCurrentMonth,
  formatDate,
  getWeekDay
};
