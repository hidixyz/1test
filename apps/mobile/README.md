# 打卡助手 Mobile (Expo)

基于 Expo + React Native 的打卡应用移动端。

## 环境要求

- Node.js 18+
- Expo CLI
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio + SDK

## 快速开始

### 1. 安装依赖

```bash
cd apps/mobile
npm install
```

### 2. 配置后端地址

编辑 `app.json`，修改 `extra.apiBaseUrl`：

```json
{
  "extra": {
    "apiBaseUrl": "http://YOUR_SERVER_IP:3001"
  }
}
```

### 3. 启动开发服务器

```bash
# 启动 Expo
npx expo start

# 或直接在模拟器运行
npx expo start --ios      # iOS 模拟器
npx expo start --android  # Android 模拟器
```

### 4. 真机测试

1. 手机安装 Expo Go 应用
2. 扫描终端中的二维码
3. 确保手机和电脑在同一 WiFi 网络

## 项目结构

```
apps/mobile/
├── app/                    # Expo Router 页面
│   ├── (tabs)/            # Tab 导航页面
│   │   ├── _layout.tsx    # Tab 布局
│   │   ├── index.tsx      # 首页
│   │   ├── checkin.tsx    # 打卡
│   │   ├── calendar.tsx   # 日历
│   │   └── records.tsx    # 记录
│   ├── calendar/
│   │   └── [date].tsx     # 日期详情
│   └── _layout.tsx        # 根布局
├── adapters/              # 平台适配器
│   ├── storage.ts         # AsyncStorage 封装
│   └── request.ts         # fetch 封装
├── api.ts                 # API 客户端
├── app.json              # Expo 配置
└── package.json
```

## 构建发布

### 本地构建

```bash
# iOS (需要 Mac + Xcode)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

### EAS Build (云构建)

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建
eas build --platform ios
eas build --platform android
```

## 代码复用

本项目复用 `shared/` 目录下的业务逻辑：

- `shared/logic/date.js` - 日期处理
- `shared/logic/checkin.js` - 打卡逻辑
- `shared/constants/` - 常量定义
