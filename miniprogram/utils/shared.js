/**
 * 共享层封装 - 微信小程序版本 (CommonJS)
 * 由于小程序使用 CommonJS，这里重新导出共享层的内容
 */

// ============ 分类模板配置 ============

// 预设分类模板
const CATEGORY_TEMPLATES = [
  {
    name: '阅读',
    icon: '📚',
    presetTags: ['小说', '技术书', '杂志', '新闻'],
    measureType: 'count',
    measureOptions: [10, 20, 30, 50, 100],
    measureUnit: '页'
  },
  {
    name: '冥想',
    icon: '🧘',
    presetTags: ['正念', '呼吸', '放松', '睡前'],
    measureType: 'duration',
    measureOptions: [5, 10, 15, 20, 30],
    measureUnit: '分钟'
  },
  {
    name: '学习',
    icon: '📝',
    presetTags: ['编程', '语言', '设计', '其他'],
    measureType: 'duration',
    measureOptions: [15, 30, 45, 60, 90],
    measureUnit: '分钟'
  },
  {
    name: '喝水',
    icon: '💧',
    presetTags: ['早晨', '上午', '下午', '晚上'],
    measureType: 'count',
    measureOptions: [1, 2, 3, 4, 5],
    measureUnit: '杯'
  },
  {
    name: '早起',
    icon: '🌅',
    presetTags: [],
    measureType: 'none',
    measureOptions: [],
    measureUnit: ''
  }
];

// 可选图标列表
const ICON_OPTIONS = [
  '📚', '🎵', '✍️', '🎮', '💪', '🧘', '🎯', '💡', '🎨', '🏃',
  '🚴', '🏊', '⚽', '🎸', '📷', '🍎', '💊', '🛏️', '☕', '🧹'
];

// 预置运动类型
const DEFAULT_EXERCISE_TYPES = ['臀腿', '肩背', '核心', '肩颈', '其他'];

// 运动时长选项
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 40];

// 运动分类的默认配置
const DEFAULT_EXERCISE_CATEGORY = {
  id: 'exercise_default',
  taskId: null,
  name: '运动',
  icon: '🏃',
  presetTags: DEFAULT_EXERCISE_TYPES,
  customTags: [],
  hiddenTags: [],
  measureType: 'duration',
  measureOptions: DURATION_OPTIONS,
  measureUnit: '分钟',
  isHidden: false,
  isCustom: false
};

// 创建分类对象
const createCategory = (taskId, categoryData) => ({
  id: `category_${taskId}`,
  taskId,
  name: categoryData.name,
  icon: categoryData.icon,
  presetTags: categoryData.presetTags || [],
  customTags: [],
  hiddenTags: [],
  measureType: categoryData.measureType,
  measureOptions: categoryData.measureOptions || [],
  measureUnit: categoryData.measureUnit || '',
  isHidden: false,
  isCustom: true
});

// ============ 存储键常量 ============

const STORAGE_KEYS = {
  CUSTOM_CATEGORIES: 'checkin_custom_categories',
  CUSTOM_EXERCISE_TYPES: 'checkin_custom_exercise_types',
  HIDDEN_PRESET_TYPES: 'checkin_hidden_preset_types',
  EXERCISE_CATEGORY_HIDDEN: 'checkin_exercise_category_hidden'
};

// ============ 日期工具函数 ============

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

const getWeekDay = (date) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(date);
  return `周${weekDays[d.getDay()]}`;
};

const formatDateKey = (year, month, day) => {
  const monthValue = String(month + 1).padStart(2, '0');
  const dayValue = String(day).padStart(2, '0');
  return `${year}-${monthValue}-${dayValue}`;
};

const parseDateParam = (dateParam) => {
  if (!dateParam) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateParam);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const isToday = (dateStr) => dateStr === getTodayDate();

const isWithinDays = (dateStr, days = 7) => {
  const target = new Date(dateStr);
  const today = new Date(getTodayDate());
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= days;
};

const isFuture = (dateStr) => {
  const target = new Date(dateStr);
  const today = new Date(getTodayDate());
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return target > today;
};

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

// ============ 日历计算逻辑 ============

const buildMonthDays = (year, month) => {
  const startDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (startDate.getDay() + 6) % 7;

  const days = [];

  for (let i = 0; i < startOffset; i++) {
    days.push({ key: `empty-${i}`, isEmpty: true });
  }

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

const getStatusByDay = (day, todayDate, checkinDates, dateKey) => {
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

const groupCheckinsByDate = (checkins) => {
  const dateMap = {};
  checkins.forEach((checkin) => {
    if (!dateMap[checkin.date]) {
      dateMap[checkin.date] = [];
    }
    dateMap[checkin.date].push(checkin);
  });
  return dateMap;
};

const formatMonthLabel = (year, month) => `${year}年${month + 1}月`;

// ============ 打卡逻辑 ============

const isTaskChecked = (taskId, checkins) => {
  return checkins.some((c) => c.task_id === taskId);
};

const getCheckedTaskIdsMap = (checkins) => {
  const map = {};
  checkins.forEach((c) => { map[c.task_id] = true; });
  return map;
};

const getUncheckedTasks = (tasks, checkins) => {
  const checkedIds = new Set(checkins.map((c) => c.task_id));
  return tasks.filter((t) => !checkedIds.has(t.id));
};

const getCategoryForTask = (task, customCategories = {}) => {
  if (task.name === '运动') {
    return { ...DEFAULT_EXERCISE_CATEGORY, taskId: task.id };
  }
  const customCategory = Object.values(customCategories).find((c) => c.taskId === task.id);
  return customCategory || null;
};

const getAllCategories = (tasks, customCategories = {}) => {
  const categories = [];
  const exerciseTask = tasks.find((t) => t.name === '运动');
  if (exerciseTask) {
    categories.push({ ...DEFAULT_EXERCISE_CATEGORY, taskId: exerciseTask.id });
  }
  Object.values(customCategories).forEach((c) => categories.push(c));
  return categories;
};

const getExistingCategoryNames = (tasks, customCategories = {}) => {
  const names = ['运动'];
  Object.values(customCategories).forEach((c) => names.push(c.name));
  tasks.forEach((t) => names.push(t.name));
  return names;
};

const buildCheckinNote = (category, selectedItems = []) => {
  if (category.measureType === 'none') {
    return JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon
    });
  }
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

const parseCheckinNote = (noteStr) => {
  if (!noteStr) return null;
  try { return JSON.parse(noteStr); }
  catch { return null; }
};

const calculateTotalMeasure = (selectedItems) => {
  return selectedItems.reduce((sum, item) => sum + item.measure, 0);
};

const getVisiblePresetTags = (presetTags = [], hiddenTags = []) => {
  return presetTags.filter((t) => !hiddenTags.includes(t));
};

const getAllAvailableTags = (presetTags = [], customTags = [], hiddenTags = []) => {
  const visiblePresetTags = getVisiblePresetTags(presetTags, hiddenTags);
  return [...visiblePresetTags, ...customTags];
};

module.exports = {
  // 常量
  CATEGORY_TEMPLATES,
  ICON_OPTIONS,
  DEFAULT_EXERCISE_TYPES,
  DURATION_OPTIONS,
  DEFAULT_EXERCISE_CATEGORY,
  STORAGE_KEYS,
  WEEK_DAYS,

  // 分类
  createCategory,

  // 日期工具
  getTodayDate,
  getCurrentMonth,
  formatDate,
  getWeekDay,
  formatDateKey,
  parseDateParam,
  isToday,
  isWithinDays,
  isFuture,

  // 日历逻辑
  buildMonthDays,
  getStatusByDay,
  groupCheckinsByDate,
  formatMonthLabel,

  // 打卡逻辑
  isTaskChecked,
  getCheckedTaskIdsMap,
  getUncheckedTasks,
  getCategoryForTask,
  getAllCategories,
  getExistingCategoryNames,
  buildCheckinNote,
  parseCheckinNote,
  calculateTotalMeasure,
  getVisiblePresetTags,
  getAllAvailableTags
};
