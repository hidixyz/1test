/**
 * 微信小程序 - HTTP 请求适配器
 * 适配 shared/api/endpoints.js 的 request 接口
 */

const app = getApp();

/**
 * 通用请求函数
 * @param {string} endpoint - API 端点
 * @param {Object} options - 请求选项
 * @param {string} options.method - HTTP 方法
 * @param {Object} options.data - 请求数据
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
 * 获取 API 基础 URL
 * @returns {string}
 */
const getApiBase = () => app.globalData.apiBase;

module.exports = {
  request,
  getApiBase
};
