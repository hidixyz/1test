/**
 * 存储键常量
 * 共享于 React Web 和微信小程序
 */

// 分类相关
export const STORAGE_KEYS = {
  // 自定义分类配置
  CUSTOM_CATEGORIES: 'checkin_custom_categories',

  // 自定义运动类型（向后兼容）
  CUSTOM_EXERCISE_TYPES: 'checkin_custom_exercise_types',

  // 隐藏的预置类型
  HIDDEN_PRESET_TYPES: 'checkin_hidden_preset_types',

  // 运动分类是否隐藏
  EXERCISE_CATEGORY_HIDDEN: 'checkin_exercise_category_hidden'
};

export default STORAGE_KEYS;
