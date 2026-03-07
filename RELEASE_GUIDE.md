# GitHub Release 发布指南

本指南说明如何将构建好的 EXE 文件发布到 GitHub Releases。

## 前置准备

1. **构建 EXE 文件**：按照 `ELECTRON_BUILD.md` 中的说明构建应用
2. **GitHub 仓库访问权限**：确保您有仓库的推送权限
3. **GitHub CLI**（可选）：用于命令行发布

## 方式 1：通过 GitHub 网页界面（推荐）

### 步骤 1：创建 Release

1. 访问 GitHub 仓库：https://github.com/Yejack819/Advanced-clock-web
2. 点击右侧的 **Releases** 链接
3. 点击 **Create a new release** 按钮

### 步骤 2：填写发布信息

| 字段 | 说明 | 示例 |
|------|------|------|
| **Tag version** | 版本标签 | `v1.0.0` |
| **Release title** | 发布标题 | `Advanced Clock v1.0.0` |
| **Describe this release** | 发布说明 | 功能说明、改进、已知问题等 |

### 步骤 3：上传 EXE 文件

1. 在 **Attach binaries** 部分，点击 **Choose files**
2. 选择构建输出目录 `dist/electron/` 中的文件：
   - `Advanced Clock.exe` - NSIS 安装程序（推荐）
   - `Advanced Clock Setup.exe` - 便携式版本（可选）

### 步骤 4：发布

1. 确认信息无误
2. 点击 **Publish release** 按钮
3. Release 创建完成，用户可以下载 EXE 文件

## 方式 2：使用 GitHub CLI

### 安装 GitHub CLI

```bash
# Windows (Chocolatey)
choco install gh

# Windows (Scoop)
scoop install gh

# macOS
brew install gh

# Linux
# 详见 https://github.com/cli/cli#installation
```

### 登录 GitHub

```bash
gh auth login
```

### 创建 Release 并上传文件

```bash
# 创建 Release 并上传单个文件
gh release create v1.0.0 dist/electron/Advanced\ Clock.exe \
  --title "Advanced Clock v1.0.0" \
  --notes "Release notes here"

# 创建 Release 并上传多个文件
gh release create v1.0.0 \
  dist/electron/Advanced\ Clock.exe \
  dist/electron/Advanced\ Clock\ Setup.exe \
  --title "Advanced Clock v1.0.0" \
  --notes "Release notes here"

# 创建草稿 Release（不立即发布）
gh release create v1.0.0 dist/electron/Advanced\ Clock.exe \
  --title "Advanced Clock v1.0.0" \
  --draft
```

### 查看已发布的 Release

```bash
# 列出所有 Release
gh release list

# 查看特定 Release 的详情
gh release view v1.0.0
```

## 方式 3：使用 Git 标签自动发布

如果配置了 GitHub Actions 工作流（需要 workflow 权限），可以通过 Git 标签自动发布：

```bash
# 创建标签
git tag v1.0.0

# 推送标签到 GitHub
git push origin v1.0.0

# GitHub Actions 会自动构建并创建 Release
```

## 发布说明模板

以下是一个发布说明的模板：

```markdown
# Advanced Clock v1.0.0

## 新功能
- ✨ 添加 Electron 桌面应用支持
- 🎨 改进 UI 设计
- 🚀 性能优化

## 改进
- 📱 响应式设计改进
- 🔧 代码重构和优化
- 📚 文档更新

## 修复
- 🐛 修复倒计时暂停/恢复问题
- 🐛 修复日期显示格式问题

## 已知问题
- 某些旧版 Windows 系统可能需要更新 .NET Framework

## 下载

- **Advanced Clock.exe** - NSIS 安装程序（推荐）
- **Advanced Clock Setup.exe** - 便携式版本

## 安装说明

### 使用 NSIS 安装程序
1. 下载 `Advanced Clock.exe`
2. 双击运行安装程序
3. 按照提示完成安装

### 使用便携式版本
1. 下载 `Advanced Clock Setup.exe`
2. 直接运行，无需安装

## 系统要求
- Windows 10 或更高版本
- 至少 100MB 可用磁盘空间

## 反馈

如有问题或建议，请在 [GitHub Issues](https://github.com/Yejack819/Advanced-clock-web/issues) 中提报。
```

## 版本号规范

建议使用语义化版本号（Semantic Versioning）：

```
v主版本号.次版本号.修订号

示例：
v1.0.0 - 初始版本
v1.1.0 - 添加新功能
v1.1.1 - 修复 bug
v2.0.0 - 重大更新
```

## 发布清单

在发布前，请检查以下项目：

- [ ] 代码已提交到 GitHub
- [ ] 版本号已更新（package.json）
- [ ] CHANGELOG 已更新
- [ ] EXE 文件已成功构建
- [ ] EXE 文件已测试可正常运行
- [ ] Release 信息已准备好
- [ ] 发布说明已编写

## 常见问题

### Q: 如何更新已发布的 Release？

A: GitHub 不允许编辑已发布 Release 的文件。如需更新，请：
1. 删除旧 Release
2. 创建新 Release 并上传更新的文件

或者创建新版本号的 Release。

### Q: 如何删除 Release？

A: 在 Release 页面点击 **Delete** 按钮。注意：删除 Release 不会删除 Git 标签。

### Q: 用户下载后如何安装？

A: 用户可以：
1. 下载 EXE 文件
2. 双击运行
3. 按照安装程序提示完成安装

### Q: 如何提供更新检查功能？

A: 可以集成 `electron-updater`，自动检查和下载更新。详见 `ELECTRON_BUILD.md`。

## 更多信息

- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub CLI 文档](https://cli.github.com/manual/)
- [语义化版本](https://semver.org/lang/zh-CN/)
