# 实验室网站项目

## 项目简介
这是一个现代化的实验室网站，包含前端展示页面和后台管理系统。采用前后端分离架构，支持响应式设计，具备完整的内容管理功能。

## ✨ 功能特性
- 🏠 **实验室主页展示** - 精美的首页设计，展示实验室形象
- 👥 **成员管理** - 完整的成员信息管理，支持分类展示
- 📰 **新闻动态** - 新闻发布、分类、置顶等功能
- 🔬 **研究项目** - 项目展示、文件管理、状态跟踪
- 📄 **发表论文** - 论文管理、分类检索
- 🎯 **研究方向** - 研究领域展示
- 🎓 **招生信息** - 招生公告管理
- 🔧 **设备资源** - 实验设备管理
- 🔐 **管理员后台** - 功能完善的后台管理系统
- 📊 **数据统计** - 访问统计、数据分析
- 📱 **响应式设计** - 完美适配各种设备

## 🛠️ 技术栈
- **后端**: Node.js + Express + MySQL
- **前端**: Vue.js 3 + Vite + Pinia
- **管理端**: Vue.js 3 + Element Plus
- **数据库**: MySQL 8.0+
- **认证**: JWT Token
- **文件上传**: Multer
- **API文档**: RESTful API

## 📁 项目结构
```
LabPage/
├── backend/              # 后端API服务
│   ├── routes/          # API路由
│   ├── middleware/      # 中间件
│   ├── database/        # 数据库连接
│   ├── uploads/         # 文件上传目录
│   └── server.js        # 服务入口
├── frontend/            # 前端展示页面
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── components/  # 通用组件
│   │   ├── stores/      # 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── admin/               # 管理员后台
│   ├── src/
│   │   ├── views/       # 管理页面
│   │   ├── layout/      # 布局组件
│   │   ├── stores/      # 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── database/            # 数据库脚本
│   └── schema.sql       # 数据库结构
├── start.sh             # Linux/Mac 启动脚本
├── start.bat            # Windows 启动脚本
└── README.md
```

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

#### Linux/Mac系统：
```bash
# 给脚本执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

#### Windows系统：
```batch
# 直接双击运行或在命令行执行
start.bat
```

### 方法二：手动启动

#### 1. 环境要求
- Node.js 16.0+
- MySQL 8.0+
- npm 或 yarn

#### 2. 安装依赖
```bash
# 安装所有依赖
npm run install-all

# 或分别安装
cd backend && npm install
cd ../frontend && npm install  
cd ../admin && npm install
```

#### 3. 数据库配置
```bash
# 1. 启动MySQL服务
# 2. 创建数据库并导入结构
mysql -u root -p < database/schema.sql

# 3. 修改数据库配置
cp backend/config.example.js backend/config.js
# 编辑 backend/config.js 文件，修改数据库连接信息
```

#### 4. 启动服务
```bash
# 启动后端服务 (端口: 8000)
cd backend && npm run dev

# 启动前端服务 (端口: 3000)  
cd frontend && npm run dev

# 启动管理端服务 (端口: 3001)
cd admin && npm run dev
```

## 🌐 访问地址
- **前端网站**: http://localhost:3000
- **管理后台**: http://localhost:3001  
- **后端API**: http://localhost:8000

## 👤 默认账号
- **用户名**: admin
- **密码**: admin123

## 📋 数据库配置
修改 `backend/config.js` 文件中的数据库配置：
```javascript
database: {
  host: 'localhost',
  port: 3306,
  database: 'lab_website',
  user: 'root',
  password: '你的MySQL密码'  // 修改为你的密码
}
```

## 🔧 开发说明

### 后端API
- 基于Express框架
- JWT认证机制
- 支持文件上传
- 完整的错误处理
- API文档规范

### 前端页面
- Vue 3 + Composition API
- Vite构建工具
- Pinia状态管理
- 响应式设计
- 现代化UI设计

### 管理后台
- Element Plus UI组件
- 完整的CRUD操作
- 数据统计图表
- 权限管理
- 文件管理

## 📝 主要功能模块

### 1. 内容管理
- **新闻管理**: 发布、编辑、删除新闻，支持富文本编辑
- **成员管理**: 添加实验室成员，分类管理（教师、学生等）
- **项目管理**: 研究项目展示，支持文件附件
- **论文管理**: 发表论文记录，支持分类和搜索

### 2. 信息展示
- **实验室介绍**: 实验室基本信息展示
- **研究方向**: 主要研究领域介绍
- **招生信息**: 研究生招生公告
- **设备资源**: 实验室设备展示

### 3. 系统管理
- **用户认证**: 管理员登录系统
- **权限控制**: 不同级别管理员权限
- **数据统计**: 访问量统计、内容统计
- **系统配置**: 网站基本配置管理

## 🎨 界面预览
- 现代化的设计风格
- 响应式布局适配
- 流畅的用户体验
- 直观的管理界面

## 🔒 安全特性
- JWT Token认证
- 密码加密存储
- 文件上传安全检查
- SQL注入防护
- XSS攻击防护

## 📱 响应式支持
- 桌面端优化显示
- 平板适配
- 移动端友好
- 触控操作支持

## 🚀 部署建议
- 使用PM2管理Node.js进程
- Nginx反向代理
- SSL证书配置
- 定期数据库备份

## 🛠️ 故障排除

### 常见问题
1. **端口占用**: 确保3000、3001、8000端口未被占用
2. **数据库连接失败**: 检查MySQL服务状态和配置信息
3. **依赖安装失败**: 尝试清除node_modules后重新安装
4. **权限问题**: 确保有文件读写权限

### 日志查看
- 后端日志: 控制台输出
- 前端日志: 浏览器开发者工具
- 数据库日志: MySQL错误日志

## 🤝 贡献指南
欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证
MIT License

## 📞 技术支持
如有问题，请查看项目文档或提交Issue。
