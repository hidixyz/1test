/**
 * 请求适配器 - React Native 版本
 * 使用 fetch API（与 Web 版本相同）
 */
import Constants from 'expo-constants';

// 从 app.json 获取 API 基础地址，或使用默认值
const API_BASE = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * 通用请求函数
 */
export const request = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
};

/**
 * GET 请求
 */
export const get = <T = any>(url: string, options?: RequestOptions): Promise<T> => {
  return request<T>(url, { ...options, method: 'GET' });
};

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> => {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * PUT 请求
 */
export const put = <T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> => {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * DELETE 请求
 */
export const del = <T = any>(url: string, options?: RequestOptions): Promise<T> => {
  return request<T>(url, { ...options, method: 'DELETE' });
};

export default { request, get, post, put, del };
