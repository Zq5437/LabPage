# 更新日志

## 2025-10-20 - 论文封面图片功能

### ✨ 新功能
- **论文封面图片支持**
  - 管理端添加论文时可选择上传封面图片（框架图/Demo图/效果图）
  - 支持 JPG、PNG、GIF、WebP 格式，最大10MB
  - 前端论文列表优雅展示封面图片
  - 未上传封面时自动使用原有的图标+年份占位符设计
  - 封面图片支持hover放大效果，提升视觉体验

### 🔧 技术改进
- 数据库添加 `publications.cover_image` 字段
- 后端支持多文件上传（PDF + 封面图片）
- 增强文件类型验证和大小限制
- 优化图片展示响应式设计

### 🎨 UI优化
- **调整论文列表左侧区域为横向比例**（280x180px）
  - 更适合展示横向的论文框架图、Demo图等
  - 鼠标悬浮显示"点击查看大图"提示
  - 点击封面图片可在弹窗中查看完整大图
  - 优化响应式布局，平板和移动端自适应调整

- **增强图片视觉效果和标签可读性**
  - 添加四周渐变暗角遮罩，增强图片边缘对比度
  - 优化类型标签样式（浅色毛玻璃效果+增强阴影），美观且确保在各种背景上可见
  - 移动端标签保持在右上角，缩小尺寸避免遮挡查看提示
  - 图片轻微调整亮度和对比度，提升整体视觉效果
  - 图片完全覆盖区域，不露出背景色

### 🐛 Bug修复
- 修复前端日期格式化方法名错误（`toLocalizedString` → `toLocaleDateString`）
- 修复后端获取单个论文详情时缺少 `cover_image` 字段的问题
- 修复管理端编辑论文时封面图片不显示的问题
- 修复论文年份显示错误（1970）的问题：`year` 字段为数字类型，不应使用 `new Date()` 解析
- 修复管理端论文编辑页面 `ElInputNumber` 警告：确保 `impact_factor` 和 `citations` 从数据库加载时转换为数字类型

### 📝 数据库变更
- `publications` 表新增 `cover_image` 字段
- 新安装使用 `schema.sql` 时已包含此字段
- 旧数据库升级请参考 `UPGRADE_GUIDE.md`

## 2025-10-20 - 安全性、配置优化和代码清理

### 🧹 代码质量改进
- **清理调试代码**
  - 清理了后端13处 `console.log` 调试输出
  - 清理了前端11处 `console.log` 调试输出
  - 清理了管理端15处 `console.log` 调试输出
  - 保留了所有 `console.error` 错误日志
  - 保留了所有 `console.warn` 警告日志
  - 保留了必要的系统启动日志

### 🐛 Bug修复
- **修复Vue警告**
  - 修复了Research页面ElTag组件type属性验证警告
  - 将空字符串类型改为'primary'，符合Element Plus规范

- **修复Members页面资源加载错误**
  - 移除了依赖外部服务 `via.placeholder.com` 的占位图片
  - 使用CSS渐变背景和文字实现默认头像显示
  - 为不同成员类别设置了不同的渐变颜色方案（教师/博士后/博士生/硕士生/本科生/校友）
  - 同步修复了 Members.vue 和 MemberDetail.vue 两个页面
  - 解决了"未能找到使用指定主机名的服务器"的网络错误

## 2025-10-20 - 安全性和配置优化

### 🔒 安全性改进
- **使用环境变量管理敏感信息**
  - 创建了 `backend/.env.example` 作为环境变量模板
  - 创建了 `backend/.env` 存储实际配置
  - 更新了 `backend/config.js` 使用 `dotenv` 包从环境变量读取配置
  - 数据库密码、JWT密钥等敏感信息不再硬编码

### 🐛 Bug修复
- 修复了 `database/schema.sql` 第77行的语法错误（删除多余的"11"）
- 统一了项目端口配置：后端5080、前端5173、管理端5174

### 🧹 代码清理
- 删除了冗余的联系路由文件：
  - `backend/routes/contact-old.js`
  - `backend/routes/contact-new.js`
- 删除了测试文件：
  - `admin/src/views/ContactMessages-test.vue`

### 📝 文档更新
- 更新了 `README.md`，添加环境变量配置说明
- 更新了 `DEVELOPMENT.md`，完善安全配置和部署指南
- 更新了 `start.sh` 和 `start.bat`，改为检查 `.env` 文件
- 更新了 `backend/config.example.js`，添加弃用说明

### 📋 配置文件变化
**新增文件：**
- `backend/.env.example` - 环境变量模板
- `backend/.env` - 实际环境变量配置（不会提交到Git）

**修改文件：**
- `backend/config.js` - 改用环境变量
- `backend/config.example.js` - 标记为弃用
- `database/schema.sql` - 修复语法错误
- `README.md` - 添加环境变量配置说明
- `DEVELOPMENT.md` - 更新安全配置说明
- `start.sh` - 检查 `.env` 文件
- `start.bat` - 检查 `.env` 文件

**删除文件：**
- `backend/routes/contact-old.js`
- `backend/routes/contact-new.js`
- `admin/src/views/ContactMessages-test.vue`

---

## 使用说明

### 首次配置
1. 复制环境变量模板：
   ```bash
   cp backend/.env.example backend/.env
   ```

2. 编辑 `backend/.env` 文件，修改以下配置：
   - `DB_PASSWORD` - 你的MySQL数据库密码
   - `JWT_SECRET` - JWT密钥（建议使用32位以上的随机字符串）

3. 导入数据库：
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. 启动服务：
   ```bash
   ./start.sh      # Mac/Linux
   # 或
   start.bat       # Windows
   ```

### 安全提示
- ⚠️ `.env` 文件包含敏感信息，已配置在 `.gitignore` 中，不会被提交到Git
- 🔒 生产环境请使用强随机密钥
- 📝 不要在代码中硬编码密码或密钥

---

**更新时间：** 2025年10月20日

