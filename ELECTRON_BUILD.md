# Electron 应用构建指南

本文档说明如何构建和发布高级时钟 Electron 应用为 Windows EXE 文件。

## 快速开始（Windows）

### 使用自动化脚本

我们提供了两个自动化脚本来简化构建过程：

#### 方式 1：使用批处理脚本（推荐）

1. 在项目根目录找到 `build-electron.bat`
2. 双击运行脚本
3. 脚本会自动完成所有构建步骤
4. EXE 文件会生成在 `dist/electron/` 目录中

#### 方式 2：使用 PowerShell 脚本

1. 打开 PowerShell
2. 进入项目目录
3. 运行命令：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\build-electron.ps1
   ```
4. EXE 文件会生成在 `dist/electron/` 目录中

### 手动构建步骤

如果自动化脚本无法使用，可以手动执行以下步骤：

```bash
# 1. 安装依赖
pnpm install

# 2. 构建 Vite 项目
pnpm run build

# 3. 编译 Electron 主进程
npx tsc electron/main.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false

# 4. 编译 Electron 预加载脚本
npx tsc electron/preload.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false

# 5. 构建 Electron 应用
pnpm run electron-build
```

## 前置要求

- **Windows 系统**（Windows 10 或更高版本）
- **Node.js 20+**：从 https://nodejs.org/ 下载安装
- **pnpm 10+**：通过 `npm install -g pnpm` 安装

## 输出文件

构建完成后，以下文件会生成在 `dist/electron/` 目录中：

| 文件名 | 说明 |
|--------|------|
| `Advanced Clock.exe` | NSIS 安装程序（推荐用于发布） |
| `Advanced Clock Setup.exe` | 便携式可执行文件（无需安装） |
| `Advanced Clock Setup.exe.blockmap` | 增量更新文件 |

## 发布到 GitHub Releases

### 手动上传

1. 在 GitHub 仓库页面点击 **Releases**
2. 点击 **Create a new release**
3. 填写版本标签（如 `v1.0.0`）和发布说明
4. 在 **Attach binaries** 部分上传 `Advanced Clock.exe` 文件
5. 点击 **Publish release**

### 使用 GitHub CLI

```bash
# 创建发布并上传文件
gh release create v1.0.0 dist/electron/Advanced\ Clock.exe --title "Advanced Clock v1.0.0" --notes "Release notes here"
```

## 开发模式

在开发过程中测试 Electron 应用：

### 方式 1：使用两个终端

```bash
# 终端 1：启动 Vite 开发服务器
pnpm run dev

# 终端 2：启动 Electron 应用
pnpm run electron-dev
```

### 方式 2：直接运行

```bash
# 构建后直接运行 Electron 应用
pnpm run build
npx electron .
```

## 项目结构

```
advanced-clock-site/
├── client/                      # React 应用源代码
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   ├── components/         # UI 组件
│   │   ├── contexts/           # React Context
│   │   ├── utils/              # 工具函数
│   │   └── App.tsx             # 主应用组件
│   └── index.html              # HTML 入口
├── electron/                    # Electron 相关文件
│   ├── main.ts                 # Electron 主进程
│   ├── main.js                 # 编译后的主进程
│   ├── preload.ts              # 预加载脚本
│   └── preload.js              # 编译后的预加载脚本
├── dist/                        # 构建输出
│   ├── index.html              # 打包的 Web 应用
│   ├── assets/                 # 静态资源
│   └── electron/               # Electron 构建输出（EXE 文件）
├── build-electron.bat          # Windows 批处理构建脚本
├── build-electron.ps1          # PowerShell 构建脚本
├── electron-builder.yml        # Electron Builder 配置
├── package.json                # 项目配置和脚本
├── vite.config.ts              # Vite 配置
└── tsconfig.json               # TypeScript 配置
```

## 配置说明

### electron-builder.yml

定义了 Windows 安装程序的配置：

```yaml
appId: com.advancedclock.app          # 应用唯一标识符
productName: Advanced Clock           # 应用显示名称
files:                                # 包含在打包中的文件
  - dist/**/*                         # 构建的 Web 应用
  - electron/**/*                     # Electron 文件
  - package.json
win:
  target:                             # 构建目标
    - nsis                            # NSIS 安装程序
    - portable                        # 便携式可执行文件
nsis:
  oneClick: false                     # 允许自定义安装目录
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true         # 创建桌面快捷方式
  createStartMenuShortcut: true       # 创建开始菜单快捷方式
```

### package.json 中的脚本

```json
{
  "scripts": {
    "electron-dev": "vite build && electron .",
    "electron-build": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.advancedclock.app",
    "productName": "Advanced Clock",
    "files": ["dist/**/*", "electron/**/*", "package.json"],
    "win": {
      "target": ["nsis", "portable"],
      "arch": ["x64"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## 常见问题

### Q: 构建时出现 "electron not found" 错误

A: 确保已安装依赖：
```bash
pnpm install
```

### Q: 如何自定义应用图标？

A: 在项目根目录创建 `assets/` 文件夹，放入以下文件：
- `icon.png` - 应用图标（512x512 或更大）
- `icon.ico` - Windows 图标

然后重新构建应用。Electron Builder 会自动使用这些图标。

### Q: 如何签名 EXE 文件？

A: 在 `electron-builder.yml` 中配置：
```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: your-password
  signingHashAlgorithms:
    - sha256
```

### Q: 安装程序太大怎么办？

A: 可以在 `electron-builder.yml` 中启用压缩：
```yaml
win:
  certificateFile: null
  signingHashAlgorithms:
    - sha256
```

### Q: 如何创建便携式版本（无需安装）？

A: 便携式版本已经包含在构建输出中。使用 `Advanced Clock Setup.exe` 文件。

### Q: 如何自动检查更新？

A: 可以集成 `electron-updater`：
```bash
pnpm add electron-updater
```

然后在 `electron/main.ts` 中配置更新逻辑。

## 故障排除

### 构建失败

1. 清除缓存：
   ```bash
   rm -r node_modules dist
   pnpm install
   ```

2. 检查 Node.js 版本：
   ```bash
   node --version  # 应该是 v20 或更高
   ```

3. 检查磁盘空间：确保有至少 1GB 的可用空间

### 应用无法启动

1. 检查 `dist/index.html` 是否存在
2. 查看 Electron 开发者工具（按 F12）中的错误信息
3. 检查 `electron/main.js` 是否正确编译

### 安装程序无法运行

1. 确保 Windows 系统已更新
2. 尝试以管理员身份运行安装程序
3. 检查是否被防病毒软件阻止

## 更多信息

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)
- [NSIS 文档](https://nsis.sourceforge.io/Docs/)

## 支持

如有问题，请在 GitHub Issues 中提报。
