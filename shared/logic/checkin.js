/**
 * 打卡状态逻辑
 * 共享于 React Web 和微信小程序
 */

import { DEFAULT_EXERCISE_CATEGORY, createCategory } from '../constants/categories.js';

/**
 * 检查任务是否已打卡
 * @param {number} taskId
 * @param {Array} checkins - 打卡记录数组
 * @returns {boolean}
 */
export const isTaskChecked = (taskId, checkins) => {
  return checkins.some((c) => c.task_id === taskId);
};

/**
 * 获取已打卡任务 ID 集合
 * @param {Array} checkins
 * @returns {Set}
 */
export const getCheckedTaskIds = (checkins) => {
  return new Set(checkins.map((c) => c.task_id));
};

/**
 * 获取已打卡任务 ID 映射
 * @param {Array} checkins
 * @returns {Object}
 */
export const getCheckedTaskIdsMap = (checkins) => {
  const map = {};
  checkins.forEach((c) => {
    map[c.task_id] = true;
  });
  return map;
};

/**
 * 获取未完成的任务
 * @param {Array} tasks - 所有任务
 * @param {Array} checkins - 打卡记录
 * @returns {Array}
 */
export const getUncheckedTasks = (tasks, checkins) => {
  const checkedIds = getCheckedTaskIds(checkins);
  return tasks.filter((t) => !checkedIds.has(t.id));
};

/**
 * 获取任务对应的分类配置
 * @param {Object} task - 任务对象
 * @param {Object} customCategories - 自定义分类配置 { categoryId: category }
 * @returns {Object|null}
 */
export const getCategoryForTask = (task, customCategories = {}) => {
  // 运动任务使用默认运动分类配置
  if (task.name === '运动') {
    return { ...DEFAULT_EXERCISE_CATEGORY, taskId: task.id };
  }

  // 查找匹配的自定义分类
  const customCategory = Object.values(customCategories).find(
    (c) => c.taskId === task.id
  );

  return customCategory || null;
};

/**
 * 获取所有分类（包括默认和自定义）
 * @param {Array} tasks
 * @param {Object} customCategories
 * @returns {Array}
 */
export const getAllCategories = (tasks, customCategories = {}) => {
  const categories = [];

  // 运动分类
  const exerciseTask = tasks.find((t) => t.name === '运动');
  if (exerciseTask) {
    categories.push({ ...DEFAULT_EXERCISE_CATEGORY, taskId: exerciseTask.id });
  }

  // 自定义分类
  Object.values(customCategories).forEach((c) => categories.push(c));

  return categories;
};

/**
 * 获取已存在的分类名称列表
 * @param {Array} tasks
 * @param {Object} customCategories
 * @returns {Array}
 */
export const getExistingCategoryNames = (tasks, customCategories = {}) => {
  const names = ['运动']; // 运动是默认分类

  // 添加所有自定义分类的名称
  Object.values(customCategories).forEach((c) => names.push(c.name));

  // 添加所有任务的名称
  tasks.forEach((t) => names.push(t.name));

  return names;
};

/**
 * 构建打卡 note（JSON 格式）
 * @param {Object} category - 分类配置
 * @param {Array} selectedItems - 选择的项目 [{ tag, measure }]
 * @returns {string}
 */
export const buildCheckinNote = (category, selectedItems = []) => {
  // 无度量类型
  if (category.measureType === 'none') {
    return JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon
    });
  }

  // 有度量项目
  const totalMeasure = selectedItems.reduce((sum, item) => sum + item.measure, 0);

  return JSON.stringify({
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    items: selectedItems.map((item) => ({ tag: item.tag, measure: item.measure })),
    totalMeasure,
    measureUnit: category.measureUnit
  });
};

/**
 * 解析打卡 note
 * @param {string} noteStr
 * @returns {Object|null}
 */
export const parseCheckinNote = (noteStr) => {
  if (!noteStr) return null;
  try {
    return JSON.parse(noteStr);
  } catch {
    return null;
  }
};

/**
 * 计算选择项目的总量
 * @param {Array} selectedItems - [{ tag, measure }]
 * @returns {number}
 */
export const calculateTotalMeasure = (selectedItems) => {
  return selectedItems.reduce((sum, item) => sum + item.measure, 0);
};

/**
 * 获取可见的预置标签
 * @param {Array} presetTags
 * @param {Array} hiddenTags
 * @returns {Array}
 */
export const getVisiblePresetTags = (presetTags = [], hiddenTags = []) => {
  return presetTags.filter((t) => !hiddenTags.includes(t));
};

/**
 * 获取所有可用标签（可见预置 + 自定义）
 * @param {Array} presetTags
 * @param {Array} customTags
 * @param {Array} hiddenTags
 * @returns {Array}
 */
export const getAllAvailableTags = (presetTags = [], customTags = [], hiddenTags = []) => {
  const visiblePresetTags = getVisiblePresetTags(presetTags, hiddenTags);
  return [...visiblePresetTags, ...customTags];
};

export { createCategory };
