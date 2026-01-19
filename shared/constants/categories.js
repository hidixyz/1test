/**
 * 分类模板配置
 * 共享于 React Web 和微信小程序
 */

// 预设分类模板
export const CATEGORY_TEMPLATES = [
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
export const ICON_OPTIONS = [
  '📚', '🎵', '✍️', '🎮', '💪', '🧘', '🎯', '💡', '🎨', '🏃',
  '🚴', '🏊', '⚽', '🎸', '📷', '🍎', '💊', '🛏️', '☕', '🧹'
];

// 预置运动类型（向后兼容）
export const DEFAULT_EXERCISE_TYPES = ['臀腿', '肩背', '核心', '肩颈', '其他'];

// 运动时长选项
export const DURATION_OPTIONS = [5, 10, 15, 20, 30, 40];

// 运动分类的默认配置
export const DEFAULT_EXERCISE_CATEGORY = {
  id: 'exercise_default',
  taskId: null, // 动态匹配
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
export const createCategory = (taskId, categoryData) => ({
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
