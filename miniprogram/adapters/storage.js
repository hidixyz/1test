/**
 * 微信小程序 - 存储适配器
 * 封装 wx 存储操作
 */

/**
 * 获取存储值
 * @param {string} key
 * @returns {Promise<any>}
 */
const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success(res) {
        try {
          resolve(typeof res.data === 'string' ? JSON.parse(res.data) : res.data);
        } catch {
          resolve(res.data);
        }
      },
      fail() {
        resolve(null);
      }
    });
  });
};

/**
 * 获取存储值（同步）
 * @param {string} key
 * @returns {any}
 */
const getStorageSync = (key) => {
  try {
    const value = wx.getStorageSync(key);
    if (!value) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

/**
 * 设置存储值
 * @param {string} key
 * @param {any} value
 * @returns {Promise}
 */
const setStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data: JSON.stringify(value),
      success() {
        resolve();
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

/**
 * 设置存储值（同步）
 * @param {string} key
 * @param {any} value
 */
const setStorageSync = (key, value) => {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error('存储失败:', e);
  }
};

/**
 * 删除存储值
 * @param {string} key
 * @returns {Promise}
 */
const removeStorage = (key) => {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success() {
        resolve();
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

/**
 * 删除存储值（同步）
 * @param {string} key
 */
const removeStorageSync = (key) => {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('删除存储失败:', e);
  }
};

/**
 * 清空所有存储
 * @returns {Promise}
 */
const clearStorage = () => {
  return new Promise((resolve, reject) => {
    wx.clearStorage({
      success() {
        resolve();
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

/**
 * 清空所有存储（同步）
 */
const clearStorageSync = () => {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('清空存储失败:', e);
  }
};

module.exports = {
  getStorage,
  getStorageSync,
  setStorage,
  setStorageSync,
  removeStorage,
  removeStorageSync,
  clearStorage,
  clearStorageSync
};
