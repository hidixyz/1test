/**
 * 存储工具函数 - 微信小程序版本
 * 封装 wx.getStorageSync / wx.setStorageSync
 */

/**
 * 获取存储数据
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
const get = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    if (value === '' || value === undefined) {
      return defaultValue;
    }
    return value;
  } catch (e) {
    console.error(`Storage get error for key "${key}":`, e);
    return defaultValue;
  }
};

/**
 * 设置存储数据
 * @param {string} key - 存储键
 * @param {*} value - 存储值
 * @returns {boolean}
 */
const set = (key, value) => {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error(`Storage set error for key "${key}":`, e);
    return false;
  }
};

/**
 * 删除存储数据
 * @param {string} key - 存储键
 * @returns {boolean}
 */
const remove = (key) => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error(`Storage remove error for key "${key}":`, e);
    return false;
  }
};

/**
 * 清空所有存储数据
 * @returns {boolean}
 */
const clear = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('Storage clear error:', e);
    return false;
  }
};

/**
 * 获取 JSON 对象
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
const getJSON = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    if (value === '' || value === undefined) {
      return defaultValue;
    }
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    console.error(`Storage getJSON error for key "${key}":`, e);
    return defaultValue;
  }
};

/**
 * 设置 JSON 对象
 * @param {string} key - 存储键
 * @param {*} value - 存储值
 * @returns {boolean}
 */
const setJSON = (key, value) => {
  try {
    const jsonString = JSON.stringify(value);
    wx.setStorageSync(key, jsonString);
    return true;
  } catch (e) {
    console.error(`Storage setJSON error for key "${key}":`, e);
    return false;
  }
};

// 存储键常量
const STORAGE_KEYS = {
  CUSTOM_EXERCISE_TYPES: 'checkin_custom_exercise_types',
  HIDDEN_PRESET_TYPES: 'checkin_hidden_preset_types',
  EXERCISE_CATEGORY_HIDDEN: 'checkin_exercise_category_hidden',
  CUSTOM_CATEGORIES: 'checkin_custom_categories'
};

module.exports = {
  get,
  set,
  remove,
  clear,
  getJSON,
  setJSON,
  STORAGE_KEYS
};
