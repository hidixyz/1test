/**
 * React Native - API 客户端
 * 复用 shared/api + mobile adapters
 */

import { request } from './adapters/request';
import { getTodayDate, getCurrentMonth } from '../../shared/logic/date.js';

// 适配 shared/api/endpoints 的 request 格式
const adaptedRequest = async (endpoint: string, options?: { method?: string; data?: any }) => {
  const { method = 'GET', data } = options || {};

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  return request(endpoint, fetchOptions);
};

/**
 * 任务 API
 */
export const tasksApi = {
  getAll: () => adaptedRequest('/api/tasks'),
  getById: (id: number) => adaptedRequest(`/api/tasks/${id}`),
  create: (data: { name: string; description?: string }) =>
    adaptedRequest('/api/tasks', { method: 'POST', data }),
  update: (id: number, data: { name?: string; description?: string }) =>
    adaptedRequest(`/api/tasks/${id}`, { method: 'PUT', data }),
  delete: (id: number) => adaptedRequest(`/api/tasks/${id}`, { method: 'DELETE' })
};

/**
 * 打卡记录 API
 */
export const checkinsApi = {
  getByDate: (date: string) => adaptedRequest(`/api/checkins?date=${date}`),
  getByMonth: (month: string) => adaptedRequest(`/api/checkins?month=${month}`),
  getAll: () => adaptedRequest('/api/checkins'),
  getById: (id: number) => adaptedRequest(`/api/checkins/${id}`),
  create: (data: { task_id: number; date: string; note?: string }) =>
    adaptedRequest('/api/checkins', { method: 'POST', data }),
  delete: (id: number) => adaptedRequest(`/api/checkins/${id}`, { method: 'DELETE' })
};

/**
 * 统计 API
 */
export const statsApi = {
  get: () => adaptedRequest('/api/stats')
};

// 导出工具函数
export { getTodayDate, getCurrentMonth };
