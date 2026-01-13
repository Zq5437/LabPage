# 实验室网站静态版本

这是从动态网站导出的静态版本，可以直接部署到 GitHub Pages 或其他静态托管服务。

**构建信息：**
- 基础路径：`/LabPage/`
- 构建时间：2025/10/27 20:12:59
- 部署类型：项目网站

## 部署到 GitHub Pages (项目网站)

**重要：此构建版本适用于项目网站，基础路径为 `/LabPage/`**

1. 在 GitHub 上创建一个新仓库（名称必须是：`LabPage`）
2. 将此目录的内容推送到该仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/LabPage.git
   git push -u origin main
   ```
3. 在仓库设置中启用 GitHub Pages：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/docs"
4. 访问 `https://your-username.github.io/LabPage/` 查看你的网站

## 部署到其他平台

你也可以将此目录部署到：
- Netlify
- Vercel
- Cloudflare Pages
- GitLab Pages

只需将整个目录上传到这些平台即可。

## 更新内容

如果你需要更新网站内容：
1. 在管理员后台修改数据
2. 在管理员后台的"设置"页面点击"导出静态网站"按钮
3. 或者运行 `npm run build:static` 命令
4. 将更新后的文件重新推送到 GitHub

---

导出时间: 2025/10/27 20:12:59
