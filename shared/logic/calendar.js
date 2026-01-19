/**
 * 日历计算逻辑
 * 共享于 React Web 和微信小程序
 */

import { formatDateKey } from './date.js';

/**
 * 构建月份日期数组
 * @param {number} year
 * @param {number} month - 0-indexed month (0=January)
 * @returns {Array} 日期数组
 */
export const buildMonthDays = (year, month) => {
  const startDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (startDate.getDay() + 6) % 7; // 周一开始

  const days = [];

  // 空白占位
  for (let i = 0; i < startOffset; i++) {
    days.push({
      key: `empty-${i}`,
      isEmpty: true
    });
  }

  // 实际日期
  for (let day = 1; day <= totalDays; day++) {
    days.push({
      key: `${year}-${month + 1}-${day}`,
      day,
      date: new Date(year, month, day),
      isEmpty: false
    });
  }

  return days;
};

/**
 * 构建月份日期数组（带状态）
 * @param {number} year
 * @param {number} month - 0-indexed month
 * @param {Object} checkinDates - 打卡数据 { 'YYYY-MM-DD': [...] }
 * @param {number} todayDate - 今天是几号
 * @returns {Array}
 */
export const buildMonthDaysWithStatus = (year, month, checkinDates, todayDate) => {
  const startDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (startDate.getDay() + 6) % 7;

  const days = [];

  // 空白占位
  for (let i = 0; i < startOffset; i++) {
    days.push({
      key: `empty-${i}`,
      isEmpty: true
    });
  }

  // 实际日期
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = formatDateKey(year, month, day);
    const status = getStatusByDay(day, todayDate, checkinDates, dateKey);

    days.push({
      key: dateKey,
      day,
      isEmpty: false,
      status
    });
  }

  return days;
};

/**
 * 根据日期获取状态
 * @param {number} day - 日期（几号）
 * @param {number} todayDate - 今天是几号
 * @param {Object} checkinDates - 打卡数据
 * @param {string} dateKey - 日期键 YYYY-MM-DD
 * @returns {Object} { label, tone }
 */
export const getStatusByDay = (day, todayDate, checkinDates, dateKey) => {
  if (day > todayDate) {
    return { label: '未开始', tone: 'future' };
  }

  const checkins = checkinDates[dateKey];
  if (checkins && checkins.length > 0) {
    return { label: `已打卡(${checkins.length})`, tone: 'success' };
  }

  if (day === todayDate) {
    return { label: '待打卡', tone: 'warning' };
  }

  return { label: '未打卡', tone: 'danger' };
};

/**
 * 按日期统计打卡数据
 * @param {Array} checkins - 打卡记录数组
 * @returns {Object} { 'YYYY-MM-DD': [checkin1, checkin2, ...] }
 */
export const groupCheckinsByDate = (checkins) => {
  const dateMap = {};
  checkins.forEach((checkin) => {
    if (!dateMap[checkin.date]) {
      dateMap[checkin.date] = [];
    }
    dateMap[checkin.date].push(checkin);
  });
  return dateMap;
};

/**
 * 格式化月份标签（中文）
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {string}
 */
export const formatMonthLabel = (year, month) => {
  return `${year}年${month + 1}月`;
};
