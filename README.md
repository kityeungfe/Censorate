# Hello World Chrome Extension

这是一个简单的Chrome扩展Hello World示例，展示了Chrome扩展的基本结构和功能。

## 📁 文件结构

```
Censorate/
├── manifest.json       # 扩展配置文件
├── hello.html         # 弹出窗口HTML
├── popup.js           # 弹出窗口JavaScript逻辑
├── favicon_io/        # 扩展图标文件夹
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── android-chrome-192x192.png
└── README.md          # 说明文档
```

## 🚀 安装和使用

### 1. 图标文件已准备就绪
扩展已配置使用 `favicon_io/` 文件夹中的图标文件：
- 16x16 像素：`favicon_io/favicon-16x16.png`
- 32x32 像素：`favicon_io/favicon-32x32.png`
- 128x128 像素：`favicon_io/android-chrome-192x192.png`

所有图标文件都已准备就绪，无需额外配置。

### 2. 加载扩展到Chrome

1. 打开Chrome浏览器
2. 在地址栏输入：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择包含这些文件的文件夹（Censorate文件夹）
6. 扩展将被加载到Chrome中

### 3. 使用扩展

1. 在Chrome工具栏中找到扩展图标
2. 点击图标打开弹出窗口
3. 你会看到一个漂亮的Hello World界面
4. 点击"点击我！"按钮体验交互效果
5. 也可以按Enter键触发按钮点击

## ✨ 功能特性

- **现代UI设计**：渐变背景和优雅的样式
- **交互式按钮**：点击按钮显示随机消息
- **键盘支持**：支持Enter键触发
- **控制台日志**：详细的调试信息
- **响应式动画**：按钮悬停和点击效果

## 🔧 技术细节

- **Manifest Version**: 3 (最新版本)
- **权限**: 无需特殊权限
- **文件类型**: HTML, CSS, JavaScript
- **兼容性**: Chrome 88+

## 📝 代码说明

### manifest.json
定义了扩展的基本信息、图标和弹出窗口配置。

### hello.html
包含弹出窗口的HTML结构和CSS样式，创建了一个美观的用户界面。

### popup.js
实现了弹出窗口的交互逻辑，包括按钮点击事件和键盘事件处理。

## 🎯 下一步

这个Hello World示例为你提供了Chrome扩展开发的基础。你可以在此基础上：

1. 添加更多功能
2. 集成Chrome APIs
3. 添加内容脚本
4. 实现数据存储
5. 添加选项页面

## 🐛 故障排除

如果扩展无法加载：
1. 确保所有文件都在同一个文件夹中
2. 检查manifest.json语法是否正确
3. 确保hello_extensions.png图标文件存在
4. 查看Chrome扩展页面的错误信息

## 📚 学习资源

- [Chrome扩展官方文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/migrating/)
- [Chrome扩展示例](https://github.com/GoogleChrome/chrome-extensions-samples)
