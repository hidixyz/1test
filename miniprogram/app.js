// app.js
App({
  globalData: {
    // API 基础地址 - 请根据实际部署修改
    apiBase: 'http://localhost:3001/api',
    userInfo: null
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('打卡应用启动');

    // 检查更新
    this.checkUpdate();
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success(res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(() => {
            wx.showToast({
              title: '更新失败，请删除小程序重新打开',
              icon: 'none'
            });
          });
        }
      });
    }
  }
});
