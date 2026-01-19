# 双端同步开发迁移指南

本指南帮助开发者理解如何在 React Web 和微信小程序之间共享业务逻辑。

## 目录结构

```
project/
├── shared/                    # 共享代码层
│   ├── constants/
│   │   ├── categories.js      # 分类模板配置
│   │   └── storage-keys.js    # 存储键常量
│   ├── logic/
│   │   ├── calendar.js        # 日历计算逻辑
│   │   ├── checkin.js         # 打卡状态逻辑
│   │   └── date.js            # 日期处理函数
│   ├── api/
│   │   └── endpoints.js       # API 端点定义
│   └── index.js               # 统一导出
│
├── src/                       # React Web
│   ├── adapters/
│   │   ├── request.js         # fetch 适配器
│   │   └── storage.js         # localStorage 适配器
│   ├── api.js                 # 使用 shared + adapters
│   └── pages/                 # UI 层
│
├── miniprogram/               # 微信小程序
│   ├── adapters/
│   │   ├── request.js         # wx.request 适配器
│   │   └── storage.js         # wx.setStorageSync 适配器
│   ├── utils/
│   │   ├── api.js             # 使用 adapters
│   │   └── shared.js          # 共享层 CommonJS 版本
│   └── pages/                 # UI 层
│
└── server/                    # 后端（不变）
```

## 共享层使用说明

### React Web (ES Modules)

```javascript
// 直接从 shared 导入
import {
  CATEGORY_TEMPLATES,
  DEFAULT_EXERCISE_CATEGORY,
  STORAGE_KEYS,
  getTodayDate,
  buildMonthDays,
  getCategoryForTask
} from '../../shared/index.js';

// 或从具体模块导入
import { formatDateKey, isToday } from '../../shared/logic/date.js';
import { buildCheckinNote } from '../../shared/logic/checkin.js';
```

### 微信小程序 (CommonJS)

```javascript
// 从 shared.js 导入（CommonJS 版本）
const {
  CATEGORY_TEMPLATES,
  DEFAULT_EXERCISE_CATEGORY,
  STORAGE_KEYS,
  getTodayDate,
  buildMonthDays,
  getCategoryForTask
} = require('../../utils/shared.js');
```

## 新功能开发工作流

### 步骤 1: 分析功能

确定新功能需要：
- [ ] 新的业务逻辑（放入 shared/logic/）
- [ ] 新的常量配置（放入 shared/constants/）
- [ ] 新的 API 端点（更新 shared/api/endpoints.js）
- [ ] 平台特定的 UI 代码

### 步骤 2: 实现共享层

如果需要新的业务逻辑：

1. 在 `shared/logic/` 中创建或更新文件
2. 在 `shared/index.js` 中导出新函数
3. 同步更新 `miniprogram/utils/shared.js`（CommonJS 版本）

**示例：添加新的日期判断函数**

```javascript
// shared/logic/date.js
export const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
};
```

```javascript
// miniprogram/utils/shared.js (添加相同函数)
const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
};

module.exports = {
  // ... 其他导出
  isWeekend
};
```

### 步骤 3: 实现 React UI

```javascript
// src/pages/NewFeature.jsx
import { isWeekend } from '../../shared/logic/date.js';

const NewFeature = () => {
  // 使用共享函数
  const today = getTodayDate();
  const isWeekendDay = isWeekend(today);

  return <div>{isWeekendDay ? '周末' : '工作日'}</div>;
};
```

### 步骤 4: 实现小程序 UI

```javascript
// miniprogram/pages/new-feature/new-feature.js
const { isWeekend, getTodayDate } = require('../../utils/shared.js');

Page({
  data: {
    isWeekendDay: false
  },
  onLoad() {
    const today = getTodayDate();
    this.setData({
      isWeekendDay: isWeekend(today)
    });
  }
});
```

### 步骤 5: 提交代码

```bash
git add .
git commit -m "feat: 添加周末判断功能 (React + 小程序)"
```

## 平台适配器说明

### 请求适配器

两端使用相同的 API 接口，但底层实现不同：

| 功能 | React | 小程序 |
|------|-------|--------|
| HTTP 请求 | `fetch()` | `wx.request()` |
| 请求封装 | `src/adapters/request.js` | `miniprogram/adapters/request.js` |

### 存储适配器

| 功能 | React | 小程序 |
|------|-------|--------|
| 读取存储 | `localStorage.getItem()` | `wx.getStorageSync()` |
| 写入存储 | `localStorage.setItem()` | `wx.setStorageSync()` |
| 适配器 | `src/adapters/storage.js` | `miniprogram/adapters/storage.js` |

## 常见问题

### Q: 为什么小程序需要单独的 shared.js？

A: 微信小程序使用 CommonJS 模块系统，而 shared/ 目录使用 ES Modules。为了兼容性，我们在 `miniprogram/utils/shared.js` 中提供了 CommonJS 版本。

### Q: 如何保持两个 shared 版本同步？

A: 当修改 `shared/` 目录中的代码时，需要同步更新 `miniprogram/utils/shared.js`。建议：
1. 先修改 ES Modules 版本
2. 立即同步更新 CommonJS 版本
3. 在 PR 中检查两个版本是否一致

### Q: 可以用工具自动同步吗？

A: 未来可以考虑：
1. 使用 Rollup/Webpack 自动构建 CommonJS 版本
2. 迁移到 Taro 框架统一处理

## 功能对照检查清单

开发新功能后，确保以下项目在两端表现一致：

- [ ] 数据加载和显示正确
- [ ] 用户交互响应正确
- [ ] 错误处理一致
- [ ] 本地存储读写正确
- [ ] API 调用正确

## 相关文件

| 文件 | 说明 |
|------|------|
| `shared/constants/categories.js` | 分类模板、图标选项、运动配置 |
| `shared/constants/storage-keys.js` | localStorage 键名常量 |
| `shared/logic/date.js` | 日期处理：格式化、判断今天/未来/过去 |
| `shared/logic/calendar.js` | 日历逻辑：构建月份、状态计算 |
| `shared/logic/checkin.js` | 打卡逻辑：分类管理、note 构建 |
| `shared/api/endpoints.js` | API 端点定义（依赖注入） |
