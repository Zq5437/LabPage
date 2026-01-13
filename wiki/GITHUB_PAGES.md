# 🌐 GitHub Pages 部署完整指南

本文档整合了 GitHub Pages 部署的所有相关信息，包括部署说明、SPA 路由解决方案和检查清单。

---

## 📋 目录

- [快速开始](#快速开始)
- [部署模式](#部署模式)
- [详细步骤](#详细步骤)
- [SPA 路由解决方案](#spa-路由解决方案)
- [检查清单](#检查清单)
- [常见问题](#常见问题)

---

## 快速开始

### 三步部署

```bash
# 1. 构建静态网站
npm run build:static:project

# 2. 提交到 GitHub
git add docs/
git commit -m "Deploy static site"
git push

# 3. 在 GitHub 仓库设置中配置 Pages
# Settings -> Pages -> Source: Deploy from a branch
# Branch: main, Folder: /docs
```

### 访问地址

- 用户网站：`https://username.github.io`
- 项目网站：`https://username.github.io/repo-name/`

---

## 部署模式

GitHub Pages 支持两种部署模式：

### 1. 用户/组织网站

适用于个人或组织的主网站。

**特点：**
- **仓库名称**：必须是 `username.github.io`
- **访问地址**：`https://username.github.io`
- **基础路径**：`/`（根路径）
- **限制**：每个账号只能有一个

**示例：**
```bash
# 构建
npm run build:static:user

# 仓库地址
https://github.com/zq5437/zq5437.github.io

# 访问地址
https://zq5437.github.io
```

### 2. 项目网站

适用于具体项目的网站。

**特点：**
- **仓库名称**：任意名称（如 `lab-website`）
- **访问地址**：`https://username.github.io/repo-name/`
- **基础路径**：`/repo-name/`
- **限制**：可以有多个

**示例：**
```bash
# 构建
npm run build:static:project
# 输入仓库名称：lab-website

# 仓库地址
https://github.com/zq5437/lab-website

# 访问地址
https://zq5437.github.io/lab-website/
```

### 模式对比

| 特性 | 用户网站 | 项目网站 |
|-----|---------|---------|
| 仓库名称 | `username.github.io` | 任意名称 |
| 访问路径 | `/` | `/repo-name/` |
| 数量限制 | 每账号 1 个 | 无限制 |
| 构建命令 | `npm run build:static:user` | `npm run build:static:project` |
| 适用场景 | 个人主页 | 项目展示 |

---

## 详细步骤

### 步骤 1：选择部署模式

根据你的需求选择：
- 个人/组织主网站 → 用户网站模式
- 项目展示网站 → 项目网站模式（推荐）

### 步骤 2：构建静态网站

#### 用户网站模式

```bash
npm run build:static:user
```

#### 项目网站模式

```bash
npm run build:static:project
# 会提示输入仓库名称，例如：lab-website
```

#### 自定义基础路径

```bash
node build-static.js --base /custom-path/
```

### 步骤 3：创建 GitHub 仓库

#### 用户网站

1. 在 GitHub 创建新仓库
2. 仓库名称**必须**是：`username.github.io`（将 `username` 替换为你的 GitHub 用户名）
3. 可以是公开或私有仓库

#### 项目网站

1. 在 GitHub 创建新仓库
2. 仓库名称：任意名称（建议使用有意义的名称）
3. 仓库名称**必须**与构建时输入的名称一致
4. 可以是公开或私有仓库

### 步骤 4：推送代码

#### 新仓库（首次部署）

```bash
cd docs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

#### 已有仓库（更新部署）

```bash
git add docs/
git commit -m "Update static site"
git push
```

### 步骤 5：配置 GitHub Pages

1. 打开仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Build and deployment** 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 "main"
   - **Folder**: 选择 "/docs" ⭐（重要！）
4. 点击 **Save**

### 步骤 6：等待部署

- GitHub 会自动开始构建和部署
- 通常需要 1-5 分钟
- 部署完成后会显示网站地址
- 首次部署可能需要更长时间

### 步骤 7：访问网站

- 用户网站：`https://username.github.io`
- 项目网站：`https://username.github.io/repo-name/`

---

## SPA 路由解决方案

### 问题说明

单页应用（SPA）使用客户端路由，但 GitHub Pages 是静态服务器：

**问题场景：**
```
用户直接访问：https://username.github.io/lab-website/about
↓
GitHub Pages 查找文件：/lab-website/about/index.html
↓
找不到文件 → 返回 404
```

### 解决方案

我们使用了 GitHub Pages 的 404 重定向机制。

#### 1. 404.html 重定向

当访问不存在的路径时，GitHub Pages 会加载 `404.html`：

```html
<!-- docs/404.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>加载中...</title>
  <script>
    // 保存当前路径信息
    sessionStorage.setItem('redirect', location.href);
    // 重定向到首页
    location.replace(location.origin + location.pathname.split('/').slice(0, 2).join('/') + '/');
  </script>
</head>
<body>加载中...</body>
</html>
```

#### 2. 前端路由恢复

`index.html` 中的脚本会恢复路由：

```html
<!-- docs/index.html -->
<script>
(function() {
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    // 解码路径信息
    history.replaceState(null, null, redirect.split('#')[1] || '/');
  }
})();
</script>
```

#### 3. Vue Router 配置

使用 `createWebHistory` 启用 HTML5 History 模式：

```javascript
// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...]
})
```

### 工作流程

```
1. 用户访问：https://username.github.io/lab/about
   ↓
2. GitHub Pages 返回 404，加载 404.html
   ↓
3. 404.html 保存路径到 sessionStorage
   ↓
4. 重定向到：https://username.github.io/lab/
   ↓
5. 加载 index.html
   ↓
6. index.html 中的脚本读取 sessionStorage
   ↓
7. 使用 history.replaceState 恢复路径
   ↓
8. Vue Router 导航到 /about 页面
```

### 注意事项

1. **不影响用户体验**：
   - 重定向过程非常快（< 100ms）
   - 用户感觉不到跳转

2. **保留路由历史**：
   - 使用 `replaceState` 而非 `pushState`
   - 避免在浏览器历史中留下多余记录

3. **支持所有路由**：
   - 首页：`/`
   - 子页面：`/about`, `/news`, `/members`
   - 详情页：`/news/1`, `/members/1`

4. **兼容性好**：
   - 支持所有现代浏览器
   - 不需要服务器端配置

---

## 检查清单

### ✅ 部署前检查

#### 1. 环境准备
- [ ] Node.js 16.0+ 已安装
- [ ] 项目依赖已安装（`npm install`）
- [ ] 数据库有内容（已发布的内容）
- [ ] 图片文件已上传

#### 2. 构建配置
- [ ] 确定部署模式（用户网站/项目网站）
- [ ] 确定仓库名称
- [ ] 运行正确的构建命令

#### 3. 构建验证
- [ ] `docs/` 目录已生成
- [ ] `docs/index.html` 存在
- [ ] `docs/404.html` 存在
- [ ] `docs/static-config.json` 存在
- [ ] `docs/data/` 目录有数据文件
- [ ] `docs/uploads/` 目录有上传文件

#### 4. 本地测试
```bash
cd docs
python3 -m http.server 8000
# 访问 http://localhost:8000
```

- [ ] 首页正常显示
- [ ] 导航菜单可以点击
- [ ] 图片正常加载
- [ ] 子页面可以访问
- [ ] 详情页可以访问

### ✅ GitHub 配置检查

#### 1. 仓库设置
- [ ] 仓库已创建
- [ ] 仓库名称正确
- [ ] 对于用户网站：仓库名是 `username.github.io`
- [ ] 对于项目网站：仓库名与构建时一致

#### 2. Pages 设置
- [ ] Source: Deploy from a branch
- [ ] Branch: main（或 master）
- [ ] Folder: /docs ⭐
- [ ] 配置已保存

#### 3. 部署状态
- [ ] Actions 页面显示部署成功
- [ ] Pages 页面显示网站地址
- [ ] 地址格式正确

### ✅ 部署后验证

#### 1. 网站访问
- [ ] 可以访问网站首页
- [ ] URL 格式正确
- [ ] 没有 404 错误

#### 2. 页面功能
- [ ] 首页正常显示
- [ ] 导航菜单工作正常
- [ ] 所有页面都可以访问
- [ ] 图片正确显示
- [ ] 论文/项目列表正常
- [ ] 详情页可以打开

#### 3. 路由测试
在浏览器地址栏直接输入以下地址测试：
- [ ] `/` - 首页
- [ ] `/about` - 关于页面
- [ ] `/news` - 新闻列表
- [ ] `/news/1` - 新闻详情
- [ ] `/members` - 成员列表
- [ ] `/members/1` - 成员详情
- [ ] `/projects` - 项目列表
- [ ] `/publications` - 论文列表

#### 4. 浏览器兼容性
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] 移动端浏览器

#### 5. 性能检查
- [ ] 首屏加载时间 < 3秒
- [ ] 图片加载正常
- [ ] 无控制台错误

### ✅ 常见问题检查

如果遇到问题，按以下顺序排查：

#### 页面空白
1. [ ] 打开浏览器开发者工具（F12）
2. [ ] 查看 Console 是否有错误
3. [ ] 查看 Network 是否有 404
4. [ ] 确认基础路径配置正确

#### CSS/JS 404
1. [ ] 检查部署模式是否正确
2. [ ] 重新构建：`npm run build:static:project`
3. [ ] 确认仓库名称匹配

#### 图片无法显示
1. [ ] 确认 `docs/uploads/` 目录存在
2. [ ] 检查图片文件是否被上传到 Git
3. [ ] 查看浏览器 Network 面板中图片请求的路径

#### 直接访问子路由 404
1. [ ] 确认 `docs/404.html` 存在
2. [ ] 清空浏览器缓存
3. [ ] 使用无痕模式测试

#### 数据未更新
1. [ ] 重新导出：`npm run build:static:project`
2. [ ] 提交并推送到 GitHub
3. [ ] 清空浏览器缓存

---

## 常见问题

### 1. 用户网站和项目网站如何选择？

**推荐使用项目网站**，原因：
- 可以有多个项目网站
- 不占用用户网站配额
- 更灵活的命名

**使用用户网站**的场景：
- 作为个人主页
- 作为所有项目的入口

### 2. 可以使用自定义域名吗？

可以！步骤如下：

1. 在 GitHub Pages 设置中添加自定义域名
2. 在域名注册商处添加 DNS 记录：
   ```
   类型：CNAME
   名称：www
   值：username.github.io
   ```
3. 等待 DNS 生效（可能需要几小时）

### 3. 为什么构建后文件路径不对？

确保：
- 项目网站使用 `npm run build:static:project`
- 用户网站使用 `npm run build:static:user`
- 仓库名称与构建时输入的一致

### 4. 可以使用 GitHub Actions 自动部署吗？

可以！创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm install
    
    - name: Build static site
      run: npm run build:static:project
      env:
        REPO_NAME: your-repo-name
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
```

### 5. 如何查看部署日志？

1. 打开仓库的 **Actions** 标签
2. 点击最新的 workflow 运行
3. 查看详细日志

### 6. 部署失败怎么办？

常见原因：
- 仓库大小超过 1GB
- 单个文件超过 100MB
- `docs/` 目录不存在
- GitHub Pages 配置错误

解决方案：
1. 检查 Actions 日志
2. 确认 `docs/` 目录已提交
3. 检查文件大小
4. 重新配置 Pages 设置

### 7. 如何强制刷新缓存？

**开发者：**
```bash
# 清空缓存
git commit --allow-empty -m "Trigger rebuild"
git push
```

**用户：**
- 使用 Ctrl+F5 强制刷新
- 使用无痕模式访问
- 清空浏览器缓存

### 8. 可以部署多个语言版本吗？

可以！创建多个仓库：
- `username.github.io` - 英文版
- `lab-website-zh` - 中文版
- `lab-website-ja` - 日文版

每个仓库独立构建和部署。

---

## 最佳实践

### 1. 命名规范

**用户网站：**
```
仓库名：username.github.io
访问：https://username.github.io
```

**项目网站：**
```
仓库名：lab-website（使用有意义的名称）
访问：https://username.github.io/lab-website/
```

### 2. 部署流程

```bash
# 1. 更新内容（在管理后台）

# 2. 导出静态网站
npm run build:static:project

# 3. 测试
cd docs && python3 -m http.server 8000

# 4. 提交
git add docs/
git commit -m "feat: 添加新成员"
git push

# 5. 验证
# 访问 GitHub Pages 网站检查更新
```

### 3. 版本管理

```bash
# 使用语义化提交信息
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复显示问题"
git commit -m "docs: 更新文档"
git commit -m "style: 调整样式"
```

### 4. 定期维护

- 每周检查网站状态
- 每月更新依赖：`npm update`
- 定期备份 `docs/` 目录
- 监控 GitHub Actions 执行情况

### 5. 性能优化

- 压缩图片（使用 TinyPNG 等工具）
- 删除不需要的旧文件
- 启用 GitHub Pages 的 HTTPS

---

## 快速参考

### 构建命令

```bash
# 用户网站
npm run build:static:user

# 项目网站
npm run build:static:project

# 自定义路径
node build-static.js --base /custom-path/

# 仅导出数据
npm run export-data
```

### Git 命令

```bash
# 首次部署
cd docs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main

# 更新部署
git add docs/
git commit -m "Update"
git push
```

### 测试命令

```bash
# Python
cd docs && python3 -m http.server 8000

# Node.js
npx serve docs

# 访问
http://localhost:8000
```

---

## 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/pages)
- [Vue Router 文档](https://router.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)

---

最后更新：2025-10-27

