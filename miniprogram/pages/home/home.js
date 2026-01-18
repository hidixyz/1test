/**
 * 首页 - 微信小程序版本
 * 对应 React 版本的 src/pages/Home.jsx
 */
const { statsApi, tasksApi } = require('../../utils/api.js');

Page({
  data: {
    stats: null,
    tasks: [],
    recentCheckins: [],
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });

    try {
      const [statsData, tasksData] = await Promise.all([
        statsApi.get(),
        tasksApi.getAll()
      ]);

      // 只显示最近3条打卡记录
      const recentCheckins = statsData.recentCheckins
        ? statsData.recentCheckins.slice(0, 3)
        : [];

      this.setData({
        stats: statsData,
        tasks: tasksData,
        recentCheckins,
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
