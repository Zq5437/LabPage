# 📦 静态网站导出指南

## 简介

本项目支持将动态网站一键导出为静态版本，可部署到 GitHub Pages、Netlify、Vercel 等静态托管服务。

### 功能特点

- ✅ 完整保留网站所有已发布内容
- ✅ 自动导出所有图片和文件资源  
- ✅ 前端代码自动适配静态/动态模式
- ✅ 一键式导出，无需手动配置
- ✅ 支持用户网站和项目网站两种模式

---

## 📋 目录

- [快速开始](#快速开始)
- [导出方式](#导出方式)
- [部署到 GitHub Pages](#部署到-github-pages)
- [导出内容说明](#导出内容说明)
- [工作原理](#工作原理)
- [常见问题](#常见问题)

---

## 快速开始

### 1. 导出静态网站

```bash
# 在项目根目录运行
npm run build:static:project
```

### 2. 导出的文件在 `docs/` 目录

### 3. 部署到 GitHub Pages

```bash
# 提交到 Git
git add docs/
git commit -m "Deploy static site"
git push

# 在 GitHub 仓库设置中：
# Settings -> Pages -> Source: Deploy from a branch
# Branch: main, Folder: /docs
```

---

## 导出方式

### 方式一：通过管理员后台（推荐）

1. 登录管理员后台
2. 进入"设置"页面
3. 切换到"静态导出"选项卡
4. 点击"导出静态网站"按钮
5. 等待导出完成

导出的文件会保存在项目根目录的 `docs/` 文件夹中。

### 方式二：通过命令行

#### 完整构建（推荐）

```bash
# 用户/组织网站（username.github.io）
npm run build:static:user

# 项目网站（username.github.io/repo-name）
npm run build:static:project
# 会提示输入仓库名称
```

#### 自定义基础路径

```bash
# 指定任意基础路径
node build-static.js --base /your-repo-name/
```

#### 仅导出数据

```bash
# 只导出数据，不构建前端
npm run export-data
```

---

## 部署到 GitHub Pages

### 模式选择

GitHub Pages 有两种部署模式：

#### 1. 用户/组织网站

- **仓库名称**：`username.github.io`
- **访问地址**：`https://username.github.io`
- **构建命令**：`npm run build:static:user`

#### 2. 项目网站

- **仓库名称**：任意名称（如 `my-lab`）
- **访问地址**：`https://username.github.io/my-lab/`
- **构建命令**：`npm run build:static:project`

### 部署步骤

#### 第一步：构建静态网站

```bash
# 项目网站示例
npm run build:static:project
# 输入仓库名称，例如：my-lab
```

#### 第二步：提交到 GitHub

如果是新仓库：

```bash
cd docs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

如果已有仓库：

```bash
git add docs/
git commit -m "Update static site"
git push
```

#### 第三步：配置 GitHub Pages

1. 打开仓库的 **Settings** 页面
2. 点击左侧的 **Pages**
3. 在 **Source** 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 "main"
   - **Folder**: 选择 "/docs" ⭐
4. 点击 **Save**
5. 等待几分钟，GitHub 会自动部署

#### 第四步：访问你的网站

- 用户网站：`https://username.github.io`
- 项目网站：`https://username.github.io/repo-name/`

---

## 导出内容说明

### 文件结构

导出的 `docs/` 目录结构：

```
docs/
├── index.html              # 前端入口文件
├── 404.html               # SPA 路由支持
├── static-config.json     # 静态模式标识
├── README.md              # 部署说明
├── css/                   # 样式文件
├── js/                    # JavaScript 文件
├── data/                  # 数据文件（JSON格式）
│   ├── lab-info.json      # 实验室信息
│   ├── research-areas.json # 研究方向
│   ├── site-config.json   # 网站配置
│   ├── statistics.json    # 统计数据
│   ├── publications.json  # 论文列表
│   ├── recruitment.json   # 招生信息
│   ├── equipment.json     # 设备列表
│   ├── news.json          # 新闻列表
│   ├── news/              # 新闻详情
│   │   ├── 1.json
│   │   └── 2.json
│   ├── members.json       # 成员列表
│   ├── members/           # 成员详情
│   │   ├── 1.json
│   │   └── 1-publications.json
│   ├── projects.json      # 项目列表
│   └── projects/          # 项目详情
│       ├── 1.json
│       └── 2.json
└── uploads/               # 上传的文件
    ├── avatars/          # 头像
    ├── news/             # 新闻图片
    ├── projects/         # 项目图片
    ├── equipment/        # 设备图片
    ├── lab/              # 实验室图片
    └── research/         # 研究方向图片
```

### 数据格式

所有数据以 JSON 格式存储，格式示例：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "实验室新闻标题",
    "content": "新闻内容...",
    "image": "/uploads/news/image.jpg"
  }
}
```

---

## 工作原理

### 前后端自动适配

前端代码会自动检测运行模式：

#### 动态模式（开发/生产服务器）
- 从后端 API 获取数据
- 支持实时更新
- 需要数据库支持

#### 静态模式（GitHub Pages等）
- 从 JSON 文件读取数据
- 无需后端服务器
- 无需数据库

### 静态模式检测

前端通过检查 `static-config.json` 文件判断是否为静态模式：

```javascript
// 自动检测
const response = await fetch(`${BASE_URL}static-config.json`);
if (response.ok) {
  // 静态模式：从 JSON 读取
  const data = await fetch(`${BASE_URL}data/news.json`);
} else {
  // 动态模式：调用 API
  const data = await fetch('/api/news');
}
```

### API 请求拦截

所有 API 请求在静态模式下会被自动拦截并重定向到对应的 JSON 文件：

| API 路径 | 静态文件路径 |
|---------|-------------|
| `/api/lab-info` | `/data/lab-info.json` |
| `/api/news` | `/data/news.json` |
| `/api/news/1` | `/data/news/1.json` |
| `/api/members` | `/data/members.json` |
| `/api/members/1` | `/data/members/1.json` |
| `/api/projects` | `/data/projects.json` |

### URL 路径处理

静态模式下，所有资源 URL 会自动添加正确的基础路径：

```javascript
// 项目网站模式（base = /my-lab/）
图片路径: /uploads/news/image.jpg
实际访问: /my-lab/uploads/news/image.jpg

数据文件: /data/news.json  
实际访问: /my-lab/data/news.json
```

### SPA 路由支持

为了支持直接访问子路由（如 `/about`），使用了 GitHub Pages 的 404 重定向技巧：

1. 访问 `https://username.github.io/repo/about`
2. GitHub 返回 404，加载 `404.html`
3. `404.html` 将路径信息存储到 sessionStorage
4. 重定向到 `index.html`
5. Vue Router 读取路径并导航到正确页面

---

## 更新内容

### 更新步骤

1. 在管理员后台修改网站内容
2. 重新导出静态网站：`npm run build:static:project`
3. 提交更新到 GitHub：
   ```bash
   git add docs/
   git commit -m "Update content"
   git push
   ```
4. GitHub Pages 会自动重新部署（约1-5分钟）

### 注意事项

- 每次更新内容后需要重新导出
- 只导出已发布的内容（草稿不会被导出）
- 上传的新文件会自动包含在导出中

---

## 部署到其他平台

除了 GitHub Pages，你还可以部署到：

### Netlify

1. 注册 Netlify 账号
2. 点击 "New site from Git"
3. 连接你的 GitHub 仓库
4. 设置：
   - **Publish directory**: `docs`
   - 点击 "Deploy site"

### Vercel

1. 注册 Vercel 账号
2. 点击 "Import Project"
3. 导入你的 GitHub 仓库
4. 设置：
   - **Framework Preset**: Other
   - **Root Directory**: `docs`
   - 点击 "Deploy"

### Cloudflare Pages

1. 登录 Cloudflare 控制台
2. 进入 Pages
3. 点击 "Create a project"
4. 连接你的 GitHub 仓库
5. 设置：
   - **Build output directory**: `docs`
   - 点击 "Save and Deploy"

---

## 常见问题

### 1. 为什么页面是空白的？

**原因**：通常是基础路径配置不正确。

**解决方案**：
- 项目网站必须使用 `npm run build:static:project`
- 用户网站必须使用 `npm run build:static:user`
- 检查 GitHub 仓库名称是否与构建时输入的一致

### 2. CSS 和 JS 文件 404

**原因**：基础路径不匹配。

**解决方案**：
```bash
# 重新构建，确保使用正确的模式
npm run build:static:project
# 输入正确的仓库名称
```

### 3. 图片无法显示

**原因**：
- 图片路径错误
- uploads 目录未复制

**解决方案**：
- 确保运行了完整构建命令
- 检查 `docs/uploads/` 目录是否存在
- 重新导出：`npm run build:static:project`

### 4. 直接访问子路由返回 404

**原因**：GitHub Pages 不支持 SPA 路由。

**解决方案**：
- 确保 `docs/404.html` 文件存在
- 该文件会自动在构建时创建
- 如果问题仍然存在，清空浏览器缓存

### 5. 数据没有更新

**原因**：
- 忘记重新导出
- GitHub Pages 缓存

**解决方案**：
```bash
# 重新导出并提交
npm run build:static:project
git add docs/
git commit -m "Update data"
git push

# 清空浏览器缓存，或使用隐身模式访问
```

### 6. 本地预览静态网站

**方法一**：使用 Python
```bash
cd docs
python3 -m http.server 8000
# 访问 http://localhost:8000
```

**方法二**：使用 Node.js
```bash
npx serve docs
# 访问提示的地址
```

### 7. 构建后文件太大

**原因**：包含了大量上传文件。

**优化方案**：
- 压缩图片（使用 tinypng.com 等工具）
- 删除不需要的旧文件
- 将大文件托管到外部服务（如阿里云 OSS）

### 8. PDF 文件如何处理？

PDF 文件会被包含在导出中，但：
- 会增加仓库大小
- 可能超出 GitHub Pages 的限制（1GB）

**建议**：
- 将 PDF 托管到外部服务
- 或者删除 PDF，只保留链接

---

## 技术细节

### 导出脚本

导出由 `backend/export-static.js` 完成：

1. 连接数据库
2. 查询所有已发布内容
3. 转换为 JSON 格式
4. 保存到 `docs/data/` 目录
5. 复制 `uploads/` 文件夹

### 构建脚本

构建由 `build-static.js` 完成：

1. 运行导出脚本
2. 使用 Vite 构建前端（设置正确的 BASE_URL）
3. 复制构建产物到 `docs/`
4. 复制 `404.html` 用于 SPA 路由支持
5. 生成 `README.md` 部署说明

### 前端适配

前端适配在 `frontend/src/utils/api.js` 中实现：

```javascript
// 检测静态模式
const response = await fetch(`${BASE_URL}static-config.json`);
const isStatic = response.ok;

// 拦截 API 请求
api.interceptors.request.use(async config => {
  if (isStatic) {
    // 将 API 请求重定向到 JSON 文件
    const jsonPath = apiToJsonMap[config.url];
    if (jsonPath) {
      const data = await loadStaticData(jsonPath);
      // 返回伪造的响应
      config.adapter = () => Promise.resolve({ data });
    }
  }
  return config;
});
```

---

## 最佳实践

### 1. 定期更新

- 每周至少导出一次
- 重大更新后立即导出
- 设置提醒避免忘记

### 2. 版本控制

```bash
# 使用有意义的提交信息
git commit -m "feat: 添加新成员张三"
git commit -m "update: 更新实验室简介"
git commit -m "fix: 修复论文列表显示问题"
```

### 3. 测试流程

导出后本地测试：
```bash
cd docs
python3 -m http.server 8000
# 测试所有页面和功能
```

### 4. 备份策略

```bash
# 定期备份 docs 目录
tar -czf docs-backup-$(date +%Y%m%d).tar.gz docs/
```

---

## 脚本参考

### 自动化部署脚本

创建 `deploy-static.sh`：

```bash
#!/bin/bash

echo "开始构建静态网站..."

# 构建
npm run build:static:project

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "构建成功！"
  
  # 提交到 Git
  git add docs/
  git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
  git push
  
  echo "部署完成！"
else
  echo "构建失败！"
  exit 1
fi
```

使用：
```bash
chmod +x deploy-static.sh
./deploy-static.sh
```

---

最后更新：2025-10-27

