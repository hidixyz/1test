/**
 * 日历页 - 微信小程序版本
 * 对应 React 版本的 src/pages/Calendar.jsx
 */
const { checkinsApi } = require('../../utils/api.js');

Page({
  data: {
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
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
      monthLabel: this.formatMonthLabel(year, month)
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

  // 格式化月份标签
  formatMonthLabel(year, month) {
    return `${year}年${month + 1}月`;
  },

  // 构建月份日期数组
  buildMonthDays(year, month, checkinDates) {
    const startDate = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = (startDate.getDay() + 6) % 7;
    const now = new Date();
    const todayDate = now.getDate();

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
      const dateKey = this.formatDateKey(year, month, day);
      const status = this.getStatusByDay(day, todayDate, checkinDates, dateKey);

      days.push({
        key: dateKey,
        day,
        isEmpty: false,
        status
      });
    }

    return days;
  },

  // 格式化日期键
  formatDateKey(year, month, day) {
    const monthValue = String(month + 1).padStart(2, '0');
    const dayValue = String(day).padStart(2, '0');
    return `${year}-${monthValue}-${dayValue}`;
  },

  // 根据日期获取状态
  getStatusByDay(day, todayDate, checkinDates, dateKey) {
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
  },

  // 加载当月打卡数据
  async loadMonthData() {
    const { year, month } = this.data;
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    this.setData({ loading: true });

    try {
      const data = await checkinsApi.getByMonth(monthKey);

      // 按日期统计打卡数量
      const dateMap = {};
      data.forEach((checkin) => {
        if (!dateMap[checkin.date]) {
          dateMap[checkin.date] = [];
        }
        dateMap[checkin.date].push(checkin);
      });

      const monthDays = this.buildMonthDays(year, month, dateMap);

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
    const dateKey = this.formatDateKey(year, month, day);

    wx.navigateTo({
      url: `/pages/calendar-detail/calendar-detail?date=${dateKey}`
    });
  }
});
