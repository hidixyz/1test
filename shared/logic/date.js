/**
 * 日期处理工具函数
 * 共享于 React Web 和微信小程序
 */

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 * @returns {string}
 */
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取当前月份字符串 YYYY-MM
 * @returns {string}
 */
export const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或字符串
 * @param {string} format - 格式字符串，默认 'YYYY-MM-DD'
 * @returns {string}
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * 获取星期几（中文）
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string}
 */
export const getWeekDay = (date) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(date);
  return `周${weekDays[d.getDay()]}`;
};

/**
 * 格式化日期键 (用于日历)
 * @param {number} year
 * @param {number} month - 0-indexed month
 * @param {number} day
 * @returns {string}
 */
export const formatDateKey = (year, month, day) => {
  const monthValue = String(month + 1).padStart(2, '0');
  const dayValue = String(day).padStart(2, '0');
  return `${year}-${monthValue}-${dayValue}`;
};

/**
 * 解析日期参数字符串
 * @param {string} dateParam - 格式为 YYYY-MM-DD
 * @returns {Date|null}
 */
export const parseDateParam = (dateParam) => {
  if (!dateParam) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateParam);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

/**
 * 判断是否是今天
 * @param {string} dateStr - YYYY-MM-DD 格式
 * @returns {boolean}
 */
export const isToday = (dateStr) => {
  return dateStr === getTodayDate();
};

/**
 * 判断日期是否在过去N天内（不包括今天）
 * @param {string} dateStr - YYYY-MM-DD 格式
 * @param {number} days - 天数，默认7
 * @returns {boolean}
 */
export const isWithinDays = (dateStr, days = 7) => {
  const target = new Date(dateStr);
  const today = new Date(getTodayDate());
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= days;
};

/**
 * 判断是否是未来日期
 * @param {string} dateStr - YYYY-MM-DD 格式
 * @returns {boolean}
 */
export const isFuture = (dateStr) => {
  const target = new Date(dateStr);
  const today = new Date(getTodayDate());
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return target > today;
};

/**
 * 星期几名称数组（周一开始）
 */
export const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];
