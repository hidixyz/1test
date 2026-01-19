/**
 * React Web - HTTP 请求适配器
 * 适配 shared/api/endpoints.js 的 request 接口
 */

const API_BASE = 'http://localhost:3001/api';

/**
 * 通用请求函数
 * @param {string} endpoint - API 端点
 * @param {Object} options - 请求选项
 * @param {string} options.method - HTTP 方法
 * @param {Object} options.data - 请求数据
 * @returns {Promise}
 */
export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 添加请求体
  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
};

/**
 * 获取 API 基础 URL
 * @returns {string}
 */
export const getApiBase = () => API_BASE;

export default request;
