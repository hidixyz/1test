const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 支持 monorepo - 监听 shared 目录
config.watchFolders = [workspaceRoot];

// 解析 shared 模块
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 支持额外的文件扩展名
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
