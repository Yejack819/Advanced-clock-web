# 大屏网页时钟 (Advanced Clock Web)

一个功能丰富的大屏数字时钟网页应用，支持高级动画、多时区、多语言、日期倒计时、闹钟、倒计时等功能。

## ✨ 主要功能

### 核心时钟功能
- **大屏显示**：220px-500px 可调的数字大小，支持全屏显示
- **单数字滚动动画**：每个数字独立流畅的垂直滚动动画，具有 3D 翻转效果
- **冒号呼吸闪烁**：冒号具有自然的呼吸闪烁动画
- **隐藏秒功能**：可选择隐藏秒，秒固定为 00，但分钟和小时继续更新和动画

### 显示选项
- **显示日期**：在时钟下方显示年月日和星期，字号为时钟的 1/3
- **日期倒计时**：在日期上方显示"距离xx还有xxx天"的格式，支持自定义目标文字和日期
- **多时区支持**：7 个主要时区（上海、东京、纽约、洛杉矶、伦敦、巴黎、悉尼）

### 自定义选项
- **13 种字体**：包括等宽字体（JetBrains Mono、Roboto Mono、Fira Code 等）和衬线字体（Playfair Display、Lora）
- **字体颜色**：支持任意颜色自定义
- **背景颜色**：支持任意颜色自定义
- **数字间距**：-20px 到 50px 可调
- **动画速度**：0.3s 到 1.0s 可调，控制数字滚动快慢

### 高级功能
- **时间校准**：支持精度 0.1s-60s 的时间校准，显示校准前后的时间对比
- **闹钟/倒计时**：支持设置时、分、秒的倒计时，完成后有声音提醒
- **倒计时显示**：倒计时在主页面以小字显示，具有与时钟相同的滚动动画效果，支持历史记录以智能设置
- **全屏模式**：按 F 键或双击空白处进入/退出全屏，隐藏所有非时钟元素

### 快捷键支持
- **F**：全屏显示/退出全屏
- **C**：打开时间校准面板
- **S**：隐藏/显示秒
- **双击空白处**：进入/退出全屏

### 主题预设
- **赛博朋克**：绿色主题，科技感十足
- **极简白**：纯白背景，简洁优雅
- **复古绿屏**：复古绿屏风格，怀旧感

### 配置管理
- **自动保存**：所有设置自动保存至本地存储

### 界面设计
- **楷体中文字体**：全局中文使用楷体（Noto Serif SC），数字保持原字体
- **毛玻璃效果**：控制面板采用毛玻璃效果
- **动态背景适配**：根据背景亮度自动调整控制面板样式，确保所有文字清晰可见
- **紧凑布局**：优化的控制面板布局，在手机端也能完整显示

## 🚀 快速开始

### 在线使用
访问 [大屏网页时钟](https://advclock-mzsnsyep.manus.space) 直接使用

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Yejack819/advanced-clock-web.git
cd advanced-clock-web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **样式**：Tailwind CSS 4 + 自定义 CSS
- **路由**：Wouter
- **组件库**：shadcn/ui
- **构建工具**：Vite
- **包管理**：pnpm

## 📁 项目结构

```
advanced-clock-web/
├── client/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── ClockDisplay.tsx        # 时钟显示组件
│   │   │   ├── DigitRoller.tsx         # 单数字滚动组件
│   │   │   ├── ControlBar.tsx          # 控制面板
│   │   │   ├── CalibrationPanel.tsx    # 时间校准面板
│   │   │   └── AlarmCountdownPanel.tsx # 闹钟/倒计时面板
│   │   ├── contexts/         # React Context
│   │   │   └── ClockContext.tsx        # 全局时钟状态管理
│   │   ├── pages/            # 页面组件
│   │   │   └── Home.tsx              # 主页面
│   │   ├── App.tsx           # 应用主组件
│   │   ├── main.tsx          # React 入口
│   │   └── index.css         # 全局样式
│   ├── public/               # 静态资源
│   └── index.html            # HTML 模板
├── server/                   # 后端服务器（静态模式）
├── package.json              # 项目配置
└── vite.config.ts            # Vite 配置
```

## 🎨 自定义指南

### 修改默认设置

编辑 `client/src/contexts/ClockContext.tsx` 中的 `DEFAULT_SETTINGS` 对象：

```typescript
const DEFAULT_SETTINGS: ClockSettings = {
  fontSize: 220,           // 字体大小（px）
  fontFamily: 'JetBrains Mono',  // 字体
  fontColor: '#1a1a1a',    // 字体颜色
  backgroundColor: '#ffffff',    // 背景颜色
  letterSpacing: 15,       // 数字间距（px）
  animationSpeed: 0.6,     // 动画速度（s）
  // ... 其他设置
};
```

### 添加新字体

1. 在 `client/index.html` 中添加 Google Fonts 链接
2. 在 `client/src/contexts/ClockContext.tsx` 的 `FONT_OPTIONS` 中添加字体
3. 在 `client/src/index.css` 中定义字体样式

### 添加新主题

编辑 `client/src/contexts/ClockContext.tsx` 中的 `THEME_PRESETS` 对象，添加新的主题配置。

## 📱 浏览器兼容性

- Chrome/Edge：最新版本
- Firefox：最新版本
- Safari：最新版本
- 移动浏览器：iOS Safari、Chrome Mobile

## 📝 许可证

本项目采用 MIT License 开源。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：
- GitHub Issues：[提交问题](https://github.com/Yejack819/advanced-clock-web/issues)
- GitHub Discussions：[讨论](https://github.com/Yejack819/advanced-clock-web/discussions)


**Made with ❤️ by Yejack819**
