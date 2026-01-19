/**
 * API 端点定义
 * 共享于 React Web 和微信小程序
 */

/**
 * 创建 API 方法（依赖注入 request 函数）
 * @param {Function} request - 请求函数 (endpoint, options) => Promise
 * @returns {Object} API 方法集合
 */
export const createApiMethods = (request) => ({
  /**
   * 任务 API
   */
  tasks: {
    getAll: () => request('/tasks'),
    getById: (id) => request(`/tasks/${id}`),
    create: (data) => request('/tasks', { method: 'POST', data }),
    update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', data }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
  },

  /**
   * 打卡记录 API
   */
  checkins: {
    getByDate: (date) => request(`/checkins?date=${date}`),
    getByMonth: (month) => request(`/checkins?month=${month}`),
    getAll: () => request('/checkins'),
    getById: (id) => request(`/checkins/${id}`),
    create: (data) => request('/checkins', { method: 'POST', data }),
    delete: (id) => request(`/checkins/${id}`, { method: 'DELETE' })
  },

  /**
   * 统计 API
   */
  stats: {
    get: () => request('/stats')
  },

  /**
   * LLM API
   */
  llm: {
    chat: (messages, systemPrompt) =>
      request('/llm/chat', {
        method: 'POST',
        data: { messages, systemPrompt, mode: 'sync' }
      }),
    chatAsync: (messages, systemPrompt) =>
      request('/llm/chat', {
        method: 'POST',
        data: { messages, systemPrompt, mode: 'poll' }
      }),
    chatWithCallback: (messages, systemPrompt, callbackUrl) =>
      request('/llm/chat', {
        method: 'POST',
        data: { messages, systemPrompt, mode: 'callback', callbackUrl }
      }),
    getTask: (taskId) => request(`/llm/task/${taskId}`)
  }
});

/**
 * API 端点路径常量
 */
export const API_ENDPOINTS = {
  TASKS: '/tasks',
  CHECKINS: '/checkins',
  STATS: '/stats',
  LLM_CHAT: '/llm/chat',
  LLM_TASK: '/llm/task',
  HEALTH: '/health'
};

export default createApiMethods;
