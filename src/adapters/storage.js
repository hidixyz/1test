/**
 * React Web - 存储适配器
 * 封装 localStorage 操作
 */

/**
 * 获取存储值
 * @param {string} key
 * @returns {any}
 */
export const getStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * 获取存储值（同步，兼容微信小程序接口）
 * @param {string} key
 * @returns {any}
 */
export const getStorageSync = (key) => {
  return getStorage(key);
};

/**
 * 设置存储值
 * @param {string} key
 * @param {any} value
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

/**
 * 设置存储值（同步，兼容微信小程序接口）
 * @param {string} key
 * @param {any} value
 */
export const setStorageSync = (key, value) => {
  setStorage(key, value);
};

/**
 * 删除存储值
 * @param {string} key
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
};

/**
 * 删除存储值（同步）
 * @param {string} key
 */
export const removeStorageSync = (key) => {
  removeStorage(key);
};

/**
 * 清空所有存储
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch {
    // ignore storage errors
  }
};

export default {
  getStorage,
  getStorageSync,
  setStorage,
  setStorageSync,
  removeStorage,
  removeStorageSync,
  clearStorage
};
