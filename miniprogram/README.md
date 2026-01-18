# 打卡应用 - 微信小程序版本

本项目是从 React 版本重构而来的微信小程序版本。

## 项目结构

```
miniprogram/
├── app.js                    # 小程序入口文件
├── app.json                  # 小程序配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图配置
├── utils/
│   └── api.js                # API 请求封装
├── pages/
│   ├── home/                 # 首页
│   │   ├── home.js
│   │   ├── home.json
│   │   ├── home.wxml
│   │   └── home.wxss
│   ├── calendar/             # 日历页
│   │   ├── calendar.js
│   │   ├── calendar.json
│   │   ├── calendar.wxml
│   │   └── calendar.wxss
│   ├── calendar-detail/      # 日历详情页
│   │   ├── calendar-detail.js
│   │   ├── calendar-detail.json
│   │   ├── calendar-detail.wxml
│   │   └── calendar-detail.wxss
│   ├── checkin/              # 打卡页
│   │   ├── checkin.js
│   │   ├── checkin.json
│   │   ├── checkin.wxml
│   │   └── checkin.wxss
│   └── records/              # 记录页
│       ├── records.js
│       ├── records.json
│       ├── records.wxml
│       └── records.wxss
├── components/               # 自定义组件（待扩展）
└── images/                   # 图标资源（需要添加）
```

## 开发指南

### 1. 导入项目

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择「导入项目」
3. 选择 `miniprogram` 目录
4. 填入你的小程序 AppID（或使用测试号）

### 2. 配置后端 API

修改 `app.js` 中的 `apiBase` 地址：

```javascript
globalData: {
  apiBase: 'https://your-api-domain.com/api',  // 修改为你的后端地址
}
```

**注意**：微信小程序要求后端 API 必须：
- 使用 HTTPS 协议
- 在小程序后台配置服务器域名白名单

### 3. 添加 TabBar 图标

在 `images/` 目录下添加以下图标文件（推荐 81x81 像素）：
- `home.png` / `home-active.png`
- `calendar.png` / `calendar-active.png`
- `checkin.png` / `checkin-active.png`
- `records.png` / `records-active.png`

### 4. 启动后端服务

小程序需要连接后端 API 服务。请确保后端服务已启动：

```bash
# 在原 React 项目目录下
npm run server
```

## 技术栈对比

| React 版本 | 微信小程序版本 |
|-----------|--------------|
| React 18 | 小程序原生框架 |
| React Router | 页面路由 + TabBar |
| useState/useEffect | Page data + 生命周期函数 |
| fetch API | wx.request |
| localStorage | wx.getStorageSync / wx.setStorageSync |
| CSS | WXSS |
| JSX | WXML |

## 功能对应

| 功能 | React 组件 | 小程序页面 |
|-----|-----------|-----------|
| 首页 | `src/pages/Home.jsx` | `pages/home/` |
| 日历 | `src/pages/Calendar.jsx` | `pages/calendar/` |
| 日历详情 | `src/pages/CalendarDetail.jsx` | `pages/calendar-detail/` |
| 打卡 | `src/pages/Checkin.jsx` | `pages/checkin/` |
| 记录 | `src/pages/Records.jsx` | `pages/records/` |
| API 封装 | `src/api.js` | `utils/api.js` |
| 全局样式 | `src/styles/global.css` | `app.wxss` |

## 待完善功能

1. **TabBar 图标**：需要添加实际的图标文件
2. **自定义分类创建**：完整实现分类管理弹窗
3. **LLM 聊天功能**：如需使用需额外开发
4. **更多分类模板**：可扩展阅读、冥想等分类

## 注意事项

1. **域名配置**：正式发布前需在小程序后台配置服务器域名
2. **本地调试**：开发时可在「详情」→「本地设置」中勾选「不校验合法域名」
3. **数据存储**：小程序使用 `wx.setStorageSync` 替代 `localStorage`
4. **页面跳转**：TabBar 页面使用 `wx.switchTab`，普通页面使用 `wx.navigateTo`

## 后端 API

小程序复用原有后端 API，无需修改：

- `GET/POST/PUT/DELETE /api/tasks` - 任务管理
- `GET/POST/DELETE /api/checkins` - 打卡记录
- `GET /api/stats` - 统计数据
- `GET /api/health` - 健康检查
