# Electron 应用构建指南

本文档说明如何构建和发布高级时钟 Electron 应用。

## 自动化构建（推荐）

### 使用 GitHub Actions 自动构建

GitHub Actions 工作流会在以下情况自动触发：

1. **推送到 main 分支**：构建应用并上传到 Artifacts
2. **创建版本标签**（如 `v1.0.0`）：构建应用并创建 GitHub Release

#### 创建版本发布

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动：
- 在 Windows 上构建 EXE 文件
- 创建 GitHub Release
- 上传 EXE 文件到 Release

#### 查看构建结果

1. 访问 GitHub 仓库的 **Actions** 标签页
2. 查看最新的 "Build Electron App" 工作流
3. 如果是版本标签，会自动创建 Release，可在 **Releases** 页面查看

## 本地构建（Windows）

如果需要在本地 Windows 机器上构建：

### 前置要求

- Node.js 20+
- pnpm 10+
- Windows 系统

### 构建步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 构建 Vite 项目
pnpm run build

# 3. 编译 Electron 文件
npx tsc electron/main.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false
npx tsc electron/preload.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false

# 4. 构建 Electron 应用
pnpm run electron-build
```

### 输出文件

构建完成后，EXE 文件位于：
- `dist/electron/Advanced Clock.exe` - NSIS 安装程序
- `dist/electron/Advanced Clock Setup.exe` - 便携式可执行文件

## 开发模式

在开发过程中测试 Electron 应用：

```bash
# 启动开发模式（需要两个终端）

# 终端 1：启动 Vite 开发服务器
pnpm run dev

# 终端 2：启动 Electron 应用
pnpm run electron-dev
```

## 项目结构

```
advanced-clock-site/
├── client/              # React 应用源代码
├── electron/            # Electron 主进程和预加载脚本
│   ├── main.ts         # Electron 主进程
│   └── preload.ts      # 预加载脚本
├── dist/               # 构建输出
│   ├── index.html      # 打包的 Web 应用
│   └── electron/       # Electron 构建输出
├── package.json        # 项目配置和脚本
├── electron-builder.yml # Electron Builder 配置
└── .github/workflows/  # GitHub Actions 工作流
```

## 配置说明

### electron-builder.yml

定义了 Windows 安装程序的配置：
- `nsis`: NSIS 安装程序配置（允许自定义安装目录）
- `portable`: 便携式可执行文件配置

### package.json 中的 build 字段

定义了应用的元数据和打包规则：
- `appId`: 应用唯一标识符
- `productName`: 应用显示名称
- `files`: 包含在打包中的文件

## 常见问题

### Q: 为什么在 Linux/Mac 上无法构建 Windows EXE？

A: Electron Builder 需要在目标操作系统上运行才能生成原生可执行文件。要在 Linux/Mac 上构建 Windows 应用，需要使用交叉编译工具链，这比较复杂。建议使用 GitHub Actions（在 Windows 服务器上运行）或在本地 Windows 机器上构建。

### Q: 如何自定义安装程序的图标？

A: 在 `assets/` 目录中放置以下文件：
- `icon.png` - 应用图标
- `icon.ico` - Windows 图标

然后重新构建应用。

### Q: 如何签名 EXE 文件？

A: 在 `electron-builder.yml` 中配置：
```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: your-password
```

## 更多信息

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)
