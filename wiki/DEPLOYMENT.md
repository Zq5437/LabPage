# 🚀 部署指南

## 📋 目录

- [快速部署](#快速部署)
- [详细步骤](#详细步骤)
- [检查清单](#检查清单)
- [Cpolar 配置](#cpolar-配置)
- [常见问题](#常见问题)

---

## 快速部署

> 5分钟快速部署实验室网站到公网

### 前置条件

- ✅ Mac 电脑
- ✅ Nginx 已安装
- ✅ Cpolar 已安装并有固定地址
- ✅ MySQL 已安装
- ✅ Node.js 16.0+ 已安装

### 三步上线

#### 第一步：准备数据库（1分钟）

```bash
# 1. 启动 MySQL
brew services start mysql

# 2. 导入数据库
cd /Users/zhangqi/Desktop/实验室建站/2框架测试/LabPage
mysql -u root -p < database/schema.sql
# 输入你的 MySQL 密码

# 3. 配置后端环境变量
cd backend
# 确认 .env 文件存在，修改数据库密码
nano .env  # 或用任何编辑器打开
```

#### 第二步：一键部署（2分钟）

```bash
# 返回项目根目录
cd /Users/zhangqi/Desktop/实验室建站/2框架测试/LabPage

# 运行部署脚本
./deploy.sh
```

脚本会自动：
- ✅ 构建前端和管理后台
- ✅ 安装后端依赖
- ✅ 启动后端服务（使用 PM2）
- ✅ 重启 Nginx

#### 第三步：配置公网访问（2分钟）

```bash
# 方式1：使用临时地址（快速测试）
cpolar http 80

# 方式2：使用固定域名（推荐）
cpolar http -subdomain=你的固定域名 80
```

### ✨ 完成！

**本地访问：**
- 前端网站：http://localhost
- 管理后台：http://localhost/admin

**公网访问：**
- 前端网站：http://你的域名.cpolar.cn
- 管理后台：http://你的域名.cpolar.cn/admin

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

⚠️ **重要：首次登录后立即修改密码！**

---

## 详细步骤

### 1. 环境检查

```bash
# 检查 Node.js 版本
node -v          # 应显示 v16.0.0 或更高

# 检查 MySQL
mysql --version  # 应显示 8.0 或更高
brew services list | grep mysql

# 检查 Nginx
nginx -v         # 应显示版本号
brew services list | grep nginx

# 检查 Cpolar
cpolar version   # 应显示版本号

# 确保80端口未被占用
sudo lsof -i :80
```

### 2. 数据库配置

#### 启动 MySQL
```bash
brew services start mysql
```

#### 导入数据库
```bash
mysql -u root -p < database/schema.sql
```

#### 验证数据库
```bash
mysql -u root -p -e "USE lab_website; SHOW TABLES;"
```

应该看到以下表：
- users
- lab_info
- news
- members
- projects
- publications
- research_areas
- recruitment
- equipment
- contact_messages
- site_config
- statistics

### 3. 后端配置

#### 创建 .env 文件

```bash
cd backend
cp config.example.js config.js
```

#### 编辑配置文件

确保 `backend/.env` 文件配置正确：

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=lab_website
DB_USER=root
DB_PASSWORD=你的MySQL密码
JWT_SECRET=你的JWT密钥（随机字符串）
SERVER_PORT=5080
```

#### 安装依赖并启动

```bash
# 安装依赖
npm install

# 使用 PM2 启动（推荐）
npm install -g pm2
pm2 start server.js --name LabPage_backend
pm2 save
pm2 startup  # 设置开机自启
```

### 4. 前端构建

#### 构建前端展示页面
```bash
cd frontend
npm install
npm run build
```

#### 构建管理后台
```bash
cd ../admin
npm install
npm run build
```

### 5. Nginx 配置

#### 测试配置
```bash
sudo nginx -t
```

#### 启动 Nginx
```bash
sudo brew services restart nginx
```

### 6. Cpolar 内网穿透

#### 临时地址（测试用）
```bash
cpolar http 80
```

#### 固定域名（生产环境）
```bash
# 登录 cpolar 控制台配置固定域名后
cpolar http -subdomain=你的固定域名 80
```

#### 后台运行
```bash
nohup cpolar http -subdomain=你的固定域名 80 > cpolar.log 2>&1 &
```

---

## 检查清单

### ✅ 部署前检查

#### 1. 环境准备
- [ ] Node.js 已安装 (16.0+)
- [ ] MySQL 已安装并运行
- [ ] Nginx 已安装
- [ ] Cpolar 已安装并有账号
- [ ] Apache 已停止（避免端口冲突）

#### 2. 数据库配置
- [ ] MySQL 服务已启动
- [ ] 数据库 `lab_website` 已创建
- [ ] 数据库表结构已导入
- [ ] 默认管理员账号已创建

#### 3. 后端配置
- [ ] `backend/.env` 文件已创建
- [ ] 数据库密码已正确配置
- [ ] JWT_SECRET 已设置为随机字符串
- [ ] uploads 目录有写入权限

#### 4. 前端构建
- [ ] `frontend/dist` 目录已生成
- [ ] `admin/dist` 目录已生成
- [ ] 构建无错误

#### 5. Nginx 配置
- [ ] Nginx 配置文件已创建
- [ ] 配置测试通过 (`nginx -t`)
- [ ] Nginx 服务已启动

### ✅ 部署后验证

#### 1. 后端服务
```bash
# 检查后端是否运行
pm2 status
curl http://localhost:5080/api/health
```

#### 2. 前端页面
```bash
# 访问首页
curl -I http://localhost/

# 访问管理后台
curl -I http://localhost/admin/
```

#### 3. 文件上传
- [ ] 访问管理后台
- [ ] 上传测试图片
- [ ] 验证图片能正常显示

#### 4. 公网访问
- [ ] Cpolar 隧道已建立
- [ ] 可通过公网地址访问网站
- [ ] 管理后台可以登录

---

## Cpolar 配置

### 1. 安装 Cpolar

#### 下载安装
```bash
# 访问 cpolar 官网下载 Mac 版本
# https://www.cpolar.com/download
```

#### 注册账号
1. 访问 https://dashboard.cpolar.com/signup
2. 注册账号并验证邮箱

### 2. 基本使用

#### 启动临时隧道
```bash
# 穿透 HTTP 80 端口
cpolar http 80

# 穿透特定端口
cpolar http 5080
```

#### 查看隧道信息
```bash
# Web 界面（推荐）
http://localhost:9200

# 命令行查看
cpolar status
```

### 3. 配置固定域名

#### 购买固定域名
1. 登录 cpolar 控制台
2. 进入"预留"页面
3. 购买固定域名（基础版）

#### 使用固定域名
```bash
cpolar http -subdomain=你的固定域名 80
```

### 4. 配置文件方式

创建配置文件 `~/.cpolar/cpolar.yml`：

```yaml
tunnels:
  lab-website:
    proto: http
    addr: 80
    subdomain: 你的固定域名
```

使用配置文件启动：
```bash
cpolar start lab-website
```

### 5. 后台运行

#### 使用 nohup
```bash
nohup cpolar http -subdomain=你的固定域名 80 > cpolar.log 2>&1 &
```

#### 查看进程
```bash
ps aux | grep cpolar
```

#### 停止 cpolar
```bash
killall cpolar
```

### 6. 高级功能

#### 自定义域名
1. 在 cpolar 控制台添加自定义域名
2. 配置 DNS CNAME 记录
3. 使用自定义域名启动隧道

#### TCP 隧道
```bash
# 穿透 MySQL
cpolar tcp 3306
```

#### 多隧道同时运行
```bash
cpolar start-all
```

---

## 常见问题

### 1. 端口冲突

**问题：80端口被占用**

```bash
# 查看谁在占用80端口
sudo lsof -i :80

# 停止 Apache（如果在运行）
sudo apachectl stop

# 停止其他服务
sudo kill -9 进程ID
```

### 2. 后端问题

**问题：后端启动失败**

```bash
# 检查 .env 配置
cd backend && cat .env

# 检查数据库连接
mysql -u root -p -e "SELECT 1"

# 查看后端日志
pm2 logs LabPage_backend

# 重启后端
pm2 restart LabPage_backend
```

**问题：API 返回 500 错误**

- 检查数据库连接是否正常
- 查看后端日志找到具体错误
- 确认所有表都已正确创建

### 3. Nginx 问题

**问题：Nginx 无法启动**

```bash
# 测试配置文件
sudo nginx -t

# 查看错误日志
tail -f /opt/homebrew/var/log/nginx/error.log

# 检查 nginx 状态
sudo brew services list | grep nginx
```

**问题：404 错误**

- 检查 `frontend/dist` 和 `admin/dist` 目录是否存在
- 重新构建前端：`cd frontend && npm run build`
- 检查 nginx 配置中的 root 路径

### 4. Cpolar 问题

**问题：无法访问公网地址**

```bash
# 检查 cpolar 是否运行
ps aux | grep cpolar

# 访问 cpolar Web 界面
http://localhost:9200

# 重启 cpolar
killall cpolar
cpolar http -subdomain=你的固定域名 80
```

**问题：固定域名无法使用**

- 确认已在 cpolar 控制台购买固定域名
- 检查账号是否已升级
- 确认 subdomain 参数拼写正确

### 5. 上传文件问题

**问题：上传文件后无法显示**

```bash
# 检查 uploads 目录权限
ls -la backend/uploads

# 给予写入权限
chmod -R 755 backend/uploads

# 检查 nginx 配置中的 uploads 路径
```

### 6. 数据库问题

**问题：数据库连接失败**

```bash
# 检查 MySQL 是否运行
brew services list | grep mysql

# 启动 MySQL
brew services start mysql

# 测试连接
mysql -u root -p -e "SELECT 1"
```

**问题：忘记 MySQL 密码**

```bash
# 停止 MySQL
brew services stop mysql

# 以安全模式启动
mysqld_safe --skip-grant-tables &

# 重置密码
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
```

---

## 管理命令

### Nginx 管理

```bash
# 启动
sudo brew services start nginx

# 停止
sudo brew services stop nginx

# 重启
sudo brew services restart nginx

# 重新加载配置
sudo nginx -s reload

# 测试配置
sudo nginx -t

# 查看状态
sudo brew services list | grep nginx

# 查看访问日志
tail -f /opt/homebrew/var/log/nginx/lab_website.access.log

# 查看错误日志
tail -f /opt/homebrew/var/log/nginx/lab_website.error.log
```

### 后端管理（PM2）

```bash
# 启动
pm2 start server.js --name LabPage_backend

# 停止
pm2 stop LabPage_backend

# 重启
pm2 restart LabPage_backend

# 删除
pm2 delete LabPage_backend

# 查看状态
pm2 status

# 查看日志
pm2 logs LabPage_backend

# 实时日志
pm2 logs LabPage_backend --lines 50

# 监控
pm2 monit

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### MySQL 管理

```bash
# 启动
brew services start mysql

# 停止
brew services stop mysql

# 重启
brew services restart mysql

# 查看状态
brew services list | grep mysql

# 进入 MySQL
mysql -u root -p

# 备份数据库
mysqldump -u root -p lab_website > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p lab_website < backup.sql
```

### 快速命令

```bash
# 一键重启所有服务
pm2 restart LabPage_backend && sudo brew services restart nginx

# 查看所有服务状态
pm2 status && sudo brew services list

# 查看实时日志
pm2 logs LabPage_backend --lines 50
```

---

## 💡 最佳实践

### 1. 安全建议

- **修改默认密码**：首次登录后立即修改管理员密码
- **配置防火墙**：只开放必要的端口
- **使用 HTTPS**：配置 SSL 证书（Cpolar 专业版支持）
- **定期备份**：每周备份数据库和上传文件
- **更新依赖**：定期运行 `npm audit` 检查安全漏洞

### 2. 性能优化

- **启用 Gzip**：在 nginx.conf 中启用 gzip 压缩
- **使用 CDN**：将静态资源托管到 CDN
- **数据库优化**：定期清理日志，优化查询
- **PM2 集群**：使用 `pm2 start server.js -i max` 启用集群模式

### 3. 监控和维护

- **设置监控**：使用 PM2 Plus 或其他监控工具
- **定期检查日志**：每周检查错误日志
- **磁盘空间**：定期清理上传文件和日志
- **数据库优化**：每月运行 `OPTIMIZE TABLE`

### 4. 备份策略

```bash
# 创建备份目录
mkdir -p ~/backups/lab-website

# 备份数据库
mysqldump -u root -p lab_website > ~/backups/lab-website/db_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf ~/backups/lab-website/uploads_$(date +%Y%m%d).tar.gz backend/uploads/

# 自动化备份（添加到 crontab）
0 2 * * * /path/to/backup-script.sh
```

---

## 📞 获取帮助

如遇到其他问题：

1. 查看项目文档
   - `README.md` - 项目概览
   - `DEVELOPMENT.md` - 开发指南
   
2. 检查日志
   - 后端日志：`pm2 logs LabPage_backend`
   - Nginx 日志：`/opt/homebrew/var/log/nginx/`
   
3. 在 GitHub 仓库提交 Issue

---

最后更新：2025-10-27

