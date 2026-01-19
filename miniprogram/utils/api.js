/**
 * API 请求封装 - 微信小程序版本
 * 使用共享层工具函数
 */

const { request } = require('../adapters/request.js');
const {
  getTodayDate,
  getCurrentMonth,
  formatDate,
  getWeekDay
} = require('./shared.js');

/**
 * 任务 API
 */
const tasksApi = {
  getAll() {
    return request('/tasks');
  },
  getById(id) {
    return request(`/tasks/${id}`);
  },
  create(data) {
    return request('/tasks', { method: 'POST', data });
  },
  update(id, data) {
    return request(`/tasks/${id}`, { method: 'PUT', data });
  },
  delete(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  }
};

/**
 * 打卡记录 API
 */
const checkinsApi = {
  getByDate(date) {
    return request(`/checkins?date=${date}`);
  },
  getByMonth(month) {
    return request(`/checkins?month=${month}`);
  },
  getAll() {
    return request('/checkins');
  },
  getById(id) {
    return request(`/checkins/${id}`);
  },
  create(data) {
    return request('/checkins', { method: 'POST', data });
  },
  delete(id) {
    return request(`/checkins/${id}`, { method: 'DELETE' });
  }
};

/**
 * 统计 API
 */
const statsApi = {
  get() {
    return request('/stats');
  }
};

/**
 * LLM API
 */
const llmApi = {
  chat(messages, systemPrompt) {
    return request('/llm/chat', {
      method: 'POST',
      data: { messages, systemPrompt, mode: 'sync' }
    });
  },
  chatAsync(messages, systemPrompt) {
    return request('/llm/chat', {
      method: 'POST',
      data: { messages, systemPrompt, mode: 'poll' }
    });
  },
  getTask(taskId) {
    return request(`/llm/task/${taskId}`);
  }
};

module.exports = {
  request,
  tasksApi,
  checkinsApi,
  statsApi,
  llmApi,
  // 从 shared 重新导出工具函数
  getTodayDate,
  getCurrentMonth,
  formatDate,
  getWeekDay
};
