# React 到 微信小程序 技术栈映射指南

本文档记录了从 React 重构为微信小程序过程中的技术栈对应关系。

## 1. 核心概念映射

### 组件/页面结构

| React | 微信小程序 | 说明 |
|-------|-----------|------|
| `.jsx` 文件 | `.wxml` + `.js` + `.wxss` + `.json` | 小程序将结构、逻辑、样式、配置分离 |
| JSX 语法 | WXML 模板语法 | 使用 `wx:if`, `wx:for` 等指令 |
| CSS / CSS-in-JS | WXSS | 类似 CSS，支持 rpx 单位 |
| `props` | `properties` | 组件属性传递 |
| `children` | `<slot>` | 插槽机制 |

### 状态管理

| React | 微信小程序 | 说明 |
|-------|-----------|------|
| `useState` | `this.data` + `this.setData()` | 页面/组件状态 |
| `useEffect` | 生命周期函数 | `onLoad`, `onShow`, `onReady` 等 |
| `useRef` | `this.selectComponent()` | 获取组件实例 |
| `useMemo` / `useCallback` | 无直接对应 | 需手动优化 |
| Context API | `getApp().globalData` | 全局状态 |
| Redux / Zustand | 小程序状态管理库 | 如 mobx-miniprogram |

### 路由导航

| React Router | 微信小程序 | 说明 |
|--------------|-----------|------|
| `<Route>` | `app.json` pages 配置 | 页面注册 |
| `<Link>` | `<navigator>` 组件 | 声明式导航 |
| `useNavigate()` | `wx.navigateTo()` | 编程式导航 |
| `useParams()` | `onLoad(options)` | 获取路由参数 |
| `useLocation()` | 页面路径 | 当前页面信息 |
| TabBar | `app.json` tabBar 配置 | 底部导航栏 |

### 事件处理

| React | 微信小程序 | 说明 |
|-------|-----------|------|
| `onClick` | `bindtap` | 点击事件 |
| `onChange` | `bindinput` / `bindchange` | 输入/变更事件 |
| `onSubmit` | `bindsubmit` | 表单提交 |
| `e.target.value` | `e.detail.value` | 获取事件值 |
| `e.preventDefault()` | `catchtap` (阻止冒泡) | 事件修饰 |

### 网络请求

| React (fetch) | 微信小程序 | 说明 |
|---------------|-----------|------|
| `fetch()` | `wx.request()` | HTTP 请求 |
| `Response.json()` | `res.data` | 响应数据 |
| `try/catch` | `success/fail` 回调或 Promise | 错误处理 |

### 本地存储

| React (localStorage) | 微信小程序 | 说明 |
|---------------------|-----------|------|
| `localStorage.getItem()` | `wx.getStorageSync()` | 同步读取 |
| `localStorage.setItem()` | `wx.setStorageSync()` | 同步写入 |
| `localStorage.removeItem()` | `wx.removeStorageSync()` | 同步删除 |
| - | `wx.getStorage()` | 异步读取 |

## 2. 生命周期对照

### 页面生命周期

| React | 微信小程序 Page | 触发时机 |
|-------|----------------|---------|
| `useEffect(() => {}, [])` | `onLoad(options)` | 页面加载 |
| - | `onShow()` | 页面显示 |
| - | `onReady()` | 页面渲染完成 |
| - | `onHide()` | 页面隐藏 |
| `useEffect` cleanup | `onUnload()` | 页面卸载 |

### 组件生命周期

| React | 微信小程序 Component | 触发时机 |
|-------|---------------------|---------|
| constructor | `created` | 组件创建 |
| componentDidMount | `attached` | 组件挂载 |
| componentDidUpdate | `observers` | 数据变化 |
| componentWillUnmount | `detached` | 组件卸载 |

## 3. 样式单位转换

| CSS | WXSS | 说明 |
|-----|------|------|
| `px` | `rpx` | 响应式像素，750rpx = 屏幕宽度 |
| `rem` | `rpx` | 建议转换：1rem ≈ 32rpx |
| `vw/vh` | `rpx` / `100vh` | 视口单位 |
| `%` | `%` | 保持不变 |

**转换公式**: `rpx = px × 2` (基于 375px 设计稿)

## 4. 条件渲染对比

### React JSX
```jsx
{condition && <Component />}
{condition ? <A /> : <B />}
{list.map(item => <Item key={item.id} />)}
```

### WXML 模板
```xml
<view wx:if="{{condition}}">...</view>
<view wx:if="{{condition}}">A</view>
<view wx:else>B</view>
<view wx:for="{{list}}" wx:key="id">{{item.name}}</view>
```

## 5. 文件对应关系

| React 文件 | 小程序文件 | 说明 |
|-----------|-----------|------|
| `src/App.jsx` | `app.js` + `app.json` | 应用入口 |
| `src/pages/Home.jsx` | `pages/home/home.*` | 首页 |
| `src/pages/Calendar.jsx` | `pages/calendar/calendar.*` | 日历页 |
| `src/pages/CalendarDetail.jsx` | `pages/calendar-detail/calendar-detail.*` | 日历详情 |
| `src/pages/Checkin.jsx` | `pages/checkin/checkin.*` | 打卡页 |
| `src/pages/Records.jsx` | `pages/records/records.*` | 记录页 |
| `src/api.js` | `utils/api.js` | API 封装 |
| `src/styles/global.css` | `app.wxss` | 全局样式 |
| `src/components/Layout.jsx` | TabBar 配置 | 导航布局 |

## 6. 常见问题

### Q1: 如何实现组件通信？
- **父传子**: 通过 `properties` 传递
- **子传父**: 通过 `triggerEvent` 触发自定义事件
- **跨组件**: 使用 `getApp().globalData` 或状态管理库

### Q2: 如何实现页面刷新？
```javascript
onPullDownRefresh() {
  this.loadData().then(() => {
    wx.stopPullDownRefresh();
  });
}
```

### Q3: 如何处理异步操作？
小程序支持 `async/await` 和 `Promise`，与 React 一致。

### Q4: 如何调试？
使用微信开发者工具的调试面板，类似浏览器 DevTools。

## 7. 注意事项

1. **域名白名单**: 正式环境需在小程序后台配置服务器域名
2. **包大小限制**: 主包不超过 2MB，可使用分包加载
3. **API 差异**: 部分 Web API 不可用（如 `document`, `window`）
4. **样式隔离**: 组件样式默认隔离，需配置 `styleIsolation`
5. **登录授权**: 微信登录需使用 `wx.login()` 获取 code
