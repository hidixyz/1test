/**
 * 日历页 - 微信小程序版本
 * 使用共享逻辑层
 */
const { checkinsApi } = require('../../utils/api.js');
const {
  WEEK_DAYS,
  formatDateKey,
  buildMonthDays,
  getStatusByDay,
  groupCheckinsByDate,
  formatMonthLabel
} = require('../../utils/shared.js');

Page({
  data: {
    weekDays: WEEK_DAYS,
    monthDays: [],
    checkinDates: {},
    monthLabel: '',
    loading: true,
    year: 0,
    month: 0
  },

  onLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    this.setData({
      year,
      month,
      monthLabel: formatMonthLabel(year, month)
    });

    this.loadMonthData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadMonthData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMonthData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 构建月份日期数组（带状态）
  buildMonthDaysWithStatus(year, month, checkinDates) {
    const now = new Date();
    const todayDate = now.getDate();
    const days = buildMonthDays(year, month);

    // 为每个日期添加状态
    return days.map(item => {
      if (item.isEmpty) {
        return item;
      }
      const dateKey = formatDateKey(year, month, item.day);
      const status = getStatusByDay(item.day, todayDate, checkinDates, dateKey);
      return {
        ...item,
        key: dateKey,
        status
      };
    });
  },

  // 加载当月打卡数据
  async loadMonthData() {
    const { year, month } = this.data;
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    this.setData({ loading: true });

    try {
      const data = await checkinsApi.getByMonth(monthKey);

      // 使用共享函数按日期统计
      const dateMap = groupCheckinsByDate(data);
      const monthDays = this.buildMonthDaysWithStatus(year, month, dateMap);

      this.setData({
        checkinDates: dateMap,
        monthDays,
        loading: false
      });
    } catch (error) {
      console.error('加载月度数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 选择日期
  onSelectDay(e) {
    const { day } = e.currentTarget.dataset;
    if (!day) return;

    const { year, month } = this.data;
    const dateKey = formatDateKey(year, month, day);

    wx.navigateTo({
      url: `/pages/calendar-detail/calendar-detail?date=${dateKey}`
    });
  }
});
