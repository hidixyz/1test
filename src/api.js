/**
 * React Web - API 客户端
 * 使用 shared/api + adapters
 */

import { request } from './adapters/request.js';
import { createApiMethods } from '../shared/api/endpoints.js';
import { getTodayDate, getCurrentMonth } from '../shared/logic/date.js';

// 创建 API 实例
const api = createApiMethods(request);

// 导出 API 方法（保持向后兼容的命名）
export const tasksApi = api.tasks;
export const checkinsApi = api.checkins;
export const statsApi = api.stats;
export const llmApi = api.llm;

// 导出工具函数
export { getTodayDate, getCurrentMonth };

// 导出原始 request（以防需要）
export { request };
