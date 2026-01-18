/**
 * 打卡页 - 微信小程序版本
 * 对应 React 版本的 src/pages/Checkin.jsx
 */
const { tasksApi, checkinsApi, getTodayDate } = require('../../utils/api.js');

// 存储键
const CUSTOM_EXERCISE_TYPES_KEY = 'checkin_custom_exercise_types';
const EXERCISE_CATEGORY_HIDDEN_KEY = 'checkin_exercise_category_hidden';

// 预置运动类型
const DEFAULT_EXERCISE_TYPES = ['臀腿', '肩背', '核心', '肩颈', '其他'];
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 40];

Page({
  data: {
    tasks: [],
    todayCheckins: [],
    checkedTaskIds: {},
    loading: true,
    checking: null,
    submitting: false,

    // 运动打卡相关
    exerciseTags: [...DEFAULT_EXERCISE_TYPES],
    durationOptions: DURATION_OPTIONS,
    selectedExerciseTag: null,
    selectedTaskId: null,
    selectedExerciseItems: [],
    totalExerciseMinutes: 0,
    exerciseCategoryHidden: false,

    // 弹窗相关
    showTagModal: false,
    newTagValue: ''
  },

  onLoad() {
    this.loadCustomTypes();
    this.loadCategoryHidden();
  },

  onShow() {
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载自定义类型
  loadCustomTypes() {
    try {
      const saved = wx.getStorageSync(CUSTOM_EXERCISE_TYPES_KEY);
      if (saved) {
        const customTypes = JSON.parse(saved);
        this.setData({
          exerciseTags: [...DEFAULT_EXERCISE_TYPES, ...customTypes]
        });
      }
    } catch (e) {
      console.error('加载自定义类型失败:', e);
    }
  },

  // 保存自定义类型
  saveCustomTypes(customTypes) {
    try {
      wx.setStorageSync(CUSTOM_EXERCISE_TYPES_KEY, JSON.stringify(customTypes));
    } catch (e) {
      console.error('保存自定义类型失败:', e);
    }
  },

  // 加载分类隐藏状态
  loadCategoryHidden() {
    try {
      const hidden = wx.getStorageSync(EXERCISE_CATEGORY_HIDDEN_KEY);
      this.setData({
        exerciseCategoryHidden: hidden === 'true'
      });
    } catch (e) {
      console.error('加载分类状态失败:', e);
    }
  },

  // 加载数据
  async loadData() {
    const today = getTodayDate();
    this.setData({ loading: true });

    try {
      const [tasksData, checkinsData] = await Promise.all([
        tasksApi.getAll(),
        checkinsApi.getByDate(today)
      ]);

      // 构建已打卡任务ID映射
      const checkedTaskIds = {};
      checkinsData.forEach(c => {
        checkedTaskIds[c.task_id] = true;
      });

      this.setData({
        tasks: tasksData,
        todayCheckins: checkinsData,
        checkedTaskIds,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 检查任务是否已打卡
  isTaskChecked(taskId) {
    return this.data.checkedTaskIds[taskId] || false;
  },

  // 普通打卡
  async handleCheckin(e) {
    const { taskId } = e.currentTarget.dataset;
    const { checkedTaskIds } = this.data;

    if (checkedTaskIds[taskId]) {
      return;
    }

    this.setData({ checking: taskId });

    try {
      const today = getTodayDate();
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today
      });

      // 更新状态
      const updatedCheckedIds = { ...checkedTaskIds, [taskId]: true };
      const updatedCheckins = [...this.data.todayCheckins, newCheckin];

      this.setData({
        todayCheckins: updatedCheckins,
        checkedTaskIds: updatedCheckedIds,
        checking: null
      });

      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '打卡失败',
        icon: 'none'
      });
      this.setData({ checking: null });
    }
  },

  // 选择运动类型标签
  onSelectExerciseTag(e) {
    const { tag, taskId } = e.currentTarget.dataset;
    const { selectedExerciseTag, selectedTaskId } = this.data;

    if (selectedExerciseTag === tag && selectedTaskId === taskId) {
      this.setData({
        selectedExerciseTag: null,
        selectedTaskId: null
      });
    } else {
      this.setData({
        selectedExerciseTag: tag,
        selectedTaskId: taskId
      });
    }
  },

  // 选择时长
  onSelectDuration(e) {
    const { duration, taskId } = e.currentTarget.dataset;
    const { selectedExerciseTag, selectedExerciseItems } = this.data;

    if (!selectedExerciseTag) return;

    const newItem = {
      tag: selectedExerciseTag,
      measure: duration
    };

    const updatedItems = [...selectedExerciseItems, newItem];
    const totalMinutes = updatedItems.reduce((sum, item) => sum + item.measure, 0);

    this.setData({
      selectedExerciseItems: updatedItems,
      totalExerciseMinutes: totalMinutes,
      selectedExerciseTag: null
    });
  },

  // 删除已选项
  removeSelectedItem(e) {
    const { index } = e.currentTarget.dataset;
    const { selectedExerciseItems } = this.data;

    const updatedItems = selectedExerciseItems.filter((_, i) => i !== index);
    const totalMinutes = updatedItems.reduce((sum, item) => sum + item.measure, 0);

    this.setData({
      selectedExerciseItems: updatedItems,
      totalExerciseMinutes: totalMinutes
    });
  },

  // 提交运动打卡
  async submitExerciseCheckin(e) {
    const { taskId } = e.currentTarget.dataset;
    const { selectedExerciseItems, totalExerciseMinutes, checkedTaskIds, todayCheckins } = this.data;

    if (selectedExerciseItems.length === 0) return;

    this.setData({ submitting: true });

    try {
      const today = getTodayDate();
      const note = JSON.stringify({
        categoryId: 'exercise_default',
        categoryName: '运动',
        categoryIcon: '🏃',
        items: selectedExerciseItems,
        totalMeasure: totalExerciseMinutes,
        measureUnit: '分钟'
      });

      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today,
        note: note
      });

      // 更新状态
      const updatedCheckedIds = { ...checkedTaskIds, [taskId]: true };
      const updatedCheckins = [...todayCheckins, newCheckin];

      this.setData({
        todayCheckins: updatedCheckins,
        checkedTaskIds: updatedCheckedIds,
        selectedExerciseItems: [],
        totalExerciseMinutes: 0,
        selectedExerciseTag: null,
        selectedTaskId: null,
        submitting: false
      });

      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '打卡失败',
        icon: 'none'
      });
      this.setData({ submitting: false });
    }
  },

  // 显示添加标签弹窗
  showAddTagModal() {
    this.setData({
      showTagModal: true,
      newTagValue: ''
    });
  },

  // 隐藏添加标签弹窗
  hideAddTagModal() {
    this.setData({
      showTagModal: false,
      newTagValue: ''
    });
  },

  // 输入新标签
  onNewTagInput(e) {
    this.setData({
      newTagValue: e.detail.value
    });
  },

  // 添加自定义标签
  addCustomTag() {
    const { newTagValue, exerciseTags } = this.data;
    const trimmed = newTagValue.trim();

    if (!trimmed) {
      wx.showToast({
        title: '请输入类型名称',
        icon: 'none'
      });
      return;
    }

    if (exerciseTags.includes(trimmed)) {
      wx.showToast({
        title: '该类型已存在',
        icon: 'none'
      });
      return;
    }

    // 获取自定义类型列表
    const customTypes = exerciseTags.filter(t => !DEFAULT_EXERCISE_TYPES.includes(t));
    customTypes.push(trimmed);

    // 保存并更新
    this.saveCustomTypes(customTypes);
    this.setData({
      exerciseTags: [...DEFAULT_EXERCISE_TYPES, ...customTypes],
      showTagModal: false,
      newTagValue: '',
      selectedExerciseTag: trimmed
    });
  },

  // 管理运动分类
  manageExerciseCategory() {
    wx.showActionSheet({
      itemList: ['隐藏分类', '恢复预置标签'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.hideExerciseCategory();
        } else if (res.tapIndex === 1) {
          this.restorePresetTags();
        }
      }
    });
  },

  // 隐藏运动分类
  hideExerciseCategory() {
    wx.showModal({
      title: '隐藏运动分类',
      content: '确定要隐藏运动分类吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync(EXERCISE_CATEGORY_HIDDEN_KEY, 'true');
          this.setData({ exerciseCategoryHidden: true });
        }
      }
    });
  },

  // 恢复预置标签
  restorePresetTags() {
    this.setData({
      exerciseTags: [...DEFAULT_EXERCISE_TYPES]
    });
    this.saveCustomTypes([]);
    wx.showToast({
      title: '已恢复预置标签',
      icon: 'success'
    });
  },

  // 显示添加分类弹窗（暂时提示）
  showAddCategoryModal() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 空函数，用于阻止点击事件冒泡
  }
});
