/**
 * 存储适配器 - React Native 版本
 * 使用 AsyncStorage 替代 localStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 异步获取存储数据
 */
export const getStorage = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
};

/**
 * 异步设置存储数据
 */
export const setStorage = async <T = any>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage set error:', error);
  }
};

/**
 * 异步删除存储数据
 */
export const removeStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Storage remove error:', error);
  }
};

/**
 * 同步版本的封装（返回 Promise，但保持接口一致）
 * 用于兼容 shared/ 中的同步调用模式
 */
export const getStorageSync = getStorage;
export const setStorageSync = setStorage;
