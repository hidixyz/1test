/**
 * 记录页 - 微信小程序版本
 * 对应 React 版本的 src/pages/Records.jsx
 */
const { checkinsApi } = require('../../utils/api.js');

Page({
  data: {
    records: [],
    loading: true
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadRecords();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载记录
  async loadRecords() {
    this.setData({ loading: true });

    try {
      const data = await checkinsApi.getAll();
      this.setData({
        records: data,
        loading: false
      });
    } catch (error) {
      console.error('加载记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 删除记录
  handleDelete(e) {
    const { id, name } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${name}"的打卡记录吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await checkinsApi.delete(id);

            // 从列表中移除
            const records = this.data.records.filter(r => r.id !== id);
            this.setData({ records });

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
