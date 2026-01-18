/**
 * 日历详情页 - 微信小程序版本
 * 对应 React 版本的 src/pages/CalendarDetail.jsx
 */
const { checkinsApi, tasksApi, getTodayDate } = require('../../utils/api.js');

Page({
  data: {
    date: '',
    displayDate: '',
    checkins: [],
    tasks: [],
    uncheckedTasks: [],
    loading: true,
    checking: null,
    dateIsToday: false,
    dateCanMakeUp: false,
    dateIsFuture: false,
    checkinTimes: '',
    completedTaskNames: '',
    uncheckedTaskNames: ''
  },

  onLoad(options) {
    const { date } = options;
    if (date) {
      this.setData({
        date,
        displayDate: this.formatDisplayDate(date)
      });
      this.calculateDateStatus(date);
      this.loadData(date);
    }
  },

  // 格式化显示日期
  formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 周${weekDay}`;
  },

  // 计算日期状态
  calculateDateStatus(dateStr) {
    const today = getTodayDate();
    const dateIsToday = dateStr === today;

    // 判断是否在过去7天内
    const target = new Date(dateStr);
    const todayDate = new Date(today);
    target.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayDate - target) / (1000 * 60 * 60 * 24));
    const dateCanMakeUp = diffDays > 0 && diffDays <= 7;

    // 判断是否是未来日期
    const dateIsFuture = target > todayDate;

    this.setData({
      dateIsToday,
      dateCanMakeUp,
      dateIsFuture
    });
  },

  // 加载数据
  async loadData(date) {
    this.setData({ loading: true });

    try {
      const [checkinsData, tasksData] = await Promise.all([
        checkinsApi.getByDate(date),
        tasksApi.getAll()
      ]);

      // 计算未完成任务
      const checkedTaskIds = new Set(checkinsData.map(c => c.task_id));
      const uncheckedTasks = tasksData.filter(t => !checkedTaskIds.has(t.id));

      // 计算显示文本
      const checkinTimes = checkinsData.map(c => c.time).join(' / ');
      const completedTaskNames = checkinsData.map(c => c.task_name).join('、');
      const uncheckedTaskNames = uncheckedTasks.map(t => t.name).join('、');

      this.setData({
        checkins: checkinsData,
        tasks: tasksData,
        uncheckedTasks,
        checkinTimes,
        completedTaskNames,
        uncheckedTaskNames,
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

  // 补打卡
  async handleMakeupCheckin(e) {
    const { taskId } = e.currentTarget.dataset;
    const { date, checkins } = this.data;

    // 检查是否已打卡
    if (checkins.some(c => c.task_id === taskId)) {
      return;
    }

    this.setData({ checking: taskId });

    try {
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: date
      });

      // 更新数据
      const updatedCheckins = [...checkins, newCheckin];
      const checkedTaskIds = new Set(updatedCheckins.map(c => c.task_id));
      const uncheckedTasks = this.data.tasks.filter(t => !checkedTaskIds.has(t.id));

      this.setData({
        checkins: updatedCheckins,
        uncheckedTasks,
        checkinTimes: updatedCheckins.map(c => c.time).join(' / '),
        completedTaskNames: updatedCheckins.map(c => c.task_name).join('、'),
        uncheckedTaskNames: uncheckedTasks.map(t => t.name).join('、'),
        checking: null
      });

      wx.showToast({
        title: '补打卡成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '补打卡失败',
        icon: 'none'
      });
      this.setData({ checking: null });
    }
  },

  // 返回月历
  goBack() {
    wx.navigateBack();
  },

  // 跳转到打卡页面
  goToCheckin() {
    wx.switchTab({
      url: '/pages/checkin/checkin'
    });
  },

  // 跳转到记录页面
  goToRecords() {
    wx.switchTab({
      url: '/pages/records/records'
    });
  }
});
