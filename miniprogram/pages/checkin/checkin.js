/**
 * 打卡页 - 微信小程序版本
 * 使用共享逻辑层
 */
const { tasksApi, checkinsApi } = require('../../utils/api.js');
const { getStorageSync, setStorageSync } = require('../../adapters/storage.js');
const {
  STORAGE_KEYS,
  DEFAULT_EXERCISE_TYPES,
  DURATION_OPTIONS,
  DEFAULT_EXERCISE_CATEGORY,
  CATEGORY_TEMPLATES,
  ICON_OPTIONS,
  getTodayDate,
  getCheckedTaskIdsMap,
  getCategoryForTask,
  getAllCategories,
  getExistingCategoryNames,
  buildCheckinNote,
  calculateTotalMeasure,
  getVisiblePresetTags,
  getAllAvailableTags,
  createCategory
} = require('../../utils/shared.js');

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
    customTags: [],
    hiddenTags: [],
    durationOptions: DURATION_OPTIONS,
    selectedExerciseTag: null,
    selectedTaskId: null,
    selectedExerciseItems: [],
    totalExerciseMinutes: 0,
    exerciseCategoryHidden: false,

    // 自定义分类
    customCategories: {},

    // 弹窗相关
    showTagModal: false,
    newTagValue: '',
    showCreateModal: false,
    showManageModal: false,
    selectedCategoryForManage: null,

    // 创建分类表单
    createStep: 'choose',
    createName: '',
    createIcon: '📚',
    createMeasureType: 'duration',
    createMeasureOptions: [5, 10, 15, 20, 30],
    createMeasureUnit: '分钟',
    createPresetTags: [],
    createNewTagValue: '',
    createNewOptionValue: '',
    createError: '',
    creating: false,

    // 常量数据
    categoryTemplates: CATEGORY_TEMPLATES,
    iconOptions: ICON_OPTIONS
  },

  onLoad() {
    this.loadStorageData();
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

  // 加载存储数据
  loadStorageData() {
    const customTags = getStorageSync(STORAGE_KEYS.CUSTOM_EXERCISE_TYPES) || [];
    const hiddenTags = getStorageSync(STORAGE_KEYS.HIDDEN_PRESET_TYPES) || [];
    const exerciseCategoryHidden = getStorageSync(STORAGE_KEYS.EXERCISE_CATEGORY_HIDDEN) === true;
    const customCategories = getStorageSync(STORAGE_KEYS.CUSTOM_CATEGORIES) || {};

    const visiblePresetTags = getVisiblePresetTags(DEFAULT_EXERCISE_TYPES, hiddenTags);
    const exerciseTags = getAllAvailableTags(DEFAULT_EXERCISE_TYPES, customTags, hiddenTags);

    this.setData({
      customTags,
      hiddenTags,
      exerciseTags,
      exerciseCategoryHidden,
      customCategories
    });
  },

  // 保存自定义类型
  saveCustomTypes(customTypes) {
    setStorageSync(STORAGE_KEYS.CUSTOM_EXERCISE_TYPES, customTypes);
  },

  // 保存隐藏标签
  saveHiddenTags(hiddenTags) {
    setStorageSync(STORAGE_KEYS.HIDDEN_PRESET_TYPES, hiddenTags);
  },

  // 保存分类隐藏状态
  saveCategoryHidden(hidden) {
    setStorageSync(STORAGE_KEYS.EXERCISE_CATEGORY_HIDDEN, hidden);
  },

  // 保存自定义分类
  saveCustomCategories(categories) {
    setStorageSync(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
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

      // 使用共享函数构建已打卡映射
      const checkedTaskIds = getCheckedTaskIdsMap(checkinsData);

      this.setData({
        tasks: tasksData,
        todayCheckins: checkinsData,
        checkedTaskIds,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 检查任务是否已打卡
  isTaskChecked(taskId) {
    return this.data.checkedTaskIds[taskId] || false;
  },

  // 获取任务对应的分类配置
  getCategory(task) {
    return getCategoryForTask(task, this.data.customCategories);
  },

  // 普通打卡
  async handleCheckin(e) {
    const { taskId } = e.currentTarget.dataset;
    const { checkedTaskIds } = this.data;

    if (checkedTaskIds[taskId]) return;

    this.setData({ checking: taskId });

    try {
      const today = getTodayDate();
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today
      });

      const updatedCheckedIds = { ...checkedTaskIds, [taskId]: true };
      const updatedCheckins = [...this.data.todayCheckins, newCheckin];

      this.setData({
        todayCheckins: updatedCheckins,
        checkedTaskIds: updatedCheckedIds,
        checking: null
      });

      wx.showToast({ title: '打卡成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '打卡失败', icon: 'none' });
      this.setData({ checking: null });
    }
  },

  // 选择运动类型标签
  onSelectExerciseTag(e) {
    const { tag, taskId } = e.currentTarget.dataset;
    const { selectedExerciseTag, selectedTaskId } = this.data;

    if (selectedExerciseTag === tag && selectedTaskId === taskId) {
      this.setData({ selectedExerciseTag: null, selectedTaskId: null });
    } else {
      this.setData({ selectedExerciseTag: tag, selectedTaskId: taskId });
    }
  },

  // 选择时长
  onSelectDuration(e) {
    const { duration } = e.currentTarget.dataset;
    const { selectedExerciseTag, selectedExerciseItems } = this.data;

    if (!selectedExerciseTag) return;

    const newItem = { tag: selectedExerciseTag, measure: duration };
    const updatedItems = [...selectedExerciseItems, newItem];
    const totalMinutes = calculateTotalMeasure(updatedItems);

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
    const totalMinutes = calculateTotalMeasure(updatedItems);

    this.setData({
      selectedExerciseItems: updatedItems,
      totalExerciseMinutes: totalMinutes
    });
  },

  // 提交运动打卡
  async submitExerciseCheckin(e) {
    const { taskId } = e.currentTarget.dataset;
    const { selectedExerciseItems, checkedTaskIds, todayCheckins } = this.data;

    if (selectedExerciseItems.length === 0) return;

    this.setData({ submitting: true });

    try {
      const today = getTodayDate();
      const note = buildCheckinNote(DEFAULT_EXERCISE_CATEGORY, selectedExerciseItems);

      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today,
        note: note
      });

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

      wx.showToast({ title: '打卡成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '打卡失败', icon: 'none' });
      this.setData({ submitting: false });
    }
  },

  // 显示添加标签弹窗
  showAddTagModal() {
    this.setData({ showTagModal: true, newTagValue: '' });
  },

  // 隐藏添加标签弹窗
  hideAddTagModal() {
    this.setData({ showTagModal: false, newTagValue: '' });
  },

  // 输入新标签
  onNewTagInput(e) {
    this.setData({ newTagValue: e.detail.value });
  },

  // 添加自定义标签
  addCustomTag() {
    const { newTagValue, exerciseTags, customTags } = this.data;
    const trimmed = newTagValue.trim();

    if (!trimmed) {
      wx.showToast({ title: '请输入类型名称', icon: 'none' });
      return;
    }

    if (exerciseTags.includes(trimmed)) {
      wx.showToast({ title: '该类型已存在', icon: 'none' });
      return;
    }

    const newCustomTags = [...customTags, trimmed];
    this.saveCustomTypes(newCustomTags);

    this.setData({
      customTags: newCustomTags,
      exerciseTags: [...DEFAULT_EXERCISE_TYPES, ...newCustomTags],
      showTagModal: false,
      newTagValue: '',
      selectedExerciseTag: trimmed
    });
  },

  // 管理运动分类
  manageExerciseCategory() {
    const { tasks, customCategories } = this.data;
    const categories = getAllCategories(tasks, customCategories);
    const exerciseCategory = categories.find(c => c.id === 'exercise_default');

    if (exerciseCategory) {
      this.setData({
        selectedCategoryForManage: exerciseCategory,
        showManageModal: true
      });
    }
  },

  // 隐藏管理弹窗
  hideManageModal() {
    this.setData({
      showManageModal: false,
      selectedCategoryForManage: null
    });
  },

  // 隐藏运动分类
  hideExerciseCategory() {
    wx.showModal({
      title: '隐藏运动分类',
      content: '确定要隐藏运动分类吗？',
      success: (res) => {
        if (res.confirm) {
          this.saveCategoryHidden(true);
          this.setData({
            exerciseCategoryHidden: true,
            showManageModal: false
          });
        }
      }
    });
  },

  // 恢复运动分类
  restoreExerciseCategory() {
    this.saveCategoryHidden(false);
    this.setData({ exerciseCategoryHidden: false });
    wx.showToast({ title: '已恢复', icon: 'success' });
  },

  // 恢复预置标签
  restorePresetTags() {
    this.saveHiddenTags([]);
    this.setData({
      hiddenTags: [],
      exerciseTags: [...DEFAULT_EXERCISE_TYPES, ...this.data.customTags]
    });
    wx.showToast({ title: '已恢复预置标签', icon: 'success' });
  },

  // 显示添加分类弹窗
  showAddCategoryModal() {
    this.setData({
      showCreateModal: true,
      createStep: 'choose',
      createName: '',
      createIcon: '📚',
      createMeasureType: 'duration',
      createMeasureOptions: [5, 10, 15, 20, 30],
      createMeasureUnit: '分钟',
      createPresetTags: [],
      createError: ''
    });
  },

  // 隐藏添加分类弹窗
  hideAddCategoryModal() {
    this.setData({ showCreateModal: false });
  },

  // 切换到自定义创建
  switchToCustomCreate() {
    this.setData({ createStep: 'custom' });
  },

  // 返回选择模板
  backToChooseTemplate() {
    this.setData({ createStep: 'choose' });
  },

  // 从模板创建分类
  async createFromTemplate(e) {
    const { template } = e.currentTarget.dataset;
    const { tasks, customCategories } = this.data;
    const existingNames = getExistingCategoryNames(tasks, customCategories);

    if (existingNames.includes(template.name)) {
      this.setData({ createError: `"${template.name}" 分类已存在` });
      return;
    }

    this.setData({ creating: true, createError: '' });

    try {
      await this.doCreateCategory(template);
      this.setData({ showCreateModal: false, creating: false });
    } catch (error) {
      this.setData({ createError: error.message || '创建失败', creating: false });
    }
  },

  // 输入分类名称
  onCreateNameInput(e) {
    this.setData({ createName: e.detail.value });
  },

  // 选择图标
  onSelectIcon(e) {
    const { icon } = e.currentTarget.dataset;
    this.setData({ createIcon: icon });
  },

  // 选择度量类型
  onSelectMeasureType(e) {
    const { type } = e.currentTarget.dataset;
    let options = [5, 10, 15, 20, 30];
    let unit = '分钟';

    if (type === 'count') {
      options = [1, 2, 3, 5, 10];
      unit = '个';
    } else if (type === 'none') {
      options = [];
      unit = '';
    }

    this.setData({
      createMeasureType: type,
      createMeasureOptions: options,
      createMeasureUnit: unit
    });
  },

  // 自定义创建分类
  async handleCustomCreate() {
    const { createName, tasks, customCategories } = this.data;
    const trimmedName = createName.trim();

    if (!trimmedName) {
      this.setData({ createError: '请输入分类名称' });
      return;
    }

    const existingNames = getExistingCategoryNames(tasks, customCategories);
    if (existingNames.includes(trimmedName)) {
      this.setData({ createError: `"${trimmedName}" 分类已存在` });
      return;
    }

    this.setData({ creating: true, createError: '' });

    try {
      const {
        createIcon,
        createPresetTags,
        createMeasureType,
        createMeasureOptions,
        createMeasureUnit
      } = this.data;

      await this.doCreateCategory({
        name: trimmedName,
        icon: createIcon,
        presetTags: createPresetTags,
        measureType: createMeasureType,
        measureOptions: createMeasureType === 'none' ? [] : createMeasureOptions,
        measureUnit: createMeasureType === 'none' ? '' : createMeasureUnit
      });

      this.setData({ showCreateModal: false, creating: false });
    } catch (error) {
      this.setData({ createError: error.message || '创建失败', creating: false });
    }
  },

  // 执行创建分类
  async doCreateCategory(categoryData) {
    // 1. 创建后端任务
    const task = await tasksApi.create({
      name: categoryData.name,
      description: `${categoryData.icon} ${categoryData.name}打卡`
    });

    // 2. 使用共享函数创建分类配置
    const category = createCategory(task.id, categoryData);

    // 3. 保存分类配置
    const { customCategories, tasks } = this.data;
    const updatedCategories = { ...customCategories, [category.id]: category };
    this.saveCustomCategories(updatedCategories);

    // 4. 更新状态
    this.setData({
      customCategories: updatedCategories,
      tasks: [...tasks, task]
    });

    wx.showToast({ title: '创建成功', icon: 'success' });
  },

  // 阻止事件冒泡
  preventBubble() {}
});
