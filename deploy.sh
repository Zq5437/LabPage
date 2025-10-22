#!/bin/bash

# 实验室网站一键部署脚本
# 适用于 Mac 系统

set -e  # 遇到错误立即退出

echo "======================================"
echo "   实验室网站部署脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 步骤1: 检查依赖
echo -e "${YELLOW}[1/6] 检查系统依赖...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: MySQL 未安装${NC}"
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    echo -e "${RED}错误: Nginx 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 依赖检查完成${NC}"
echo ""

# 步骤2: 构建前端
echo -e "${YELLOW}[2/6] 构建前端展示页面...${NC}"
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 步骤3: 构建管理后台
echo -e "${YELLOW}[3/6] 构建管理后台...${NC}"
cd "$PROJECT_DIR/admin"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
echo -e "${GREEN}✓ 管理后台构建完成${NC}"
echo ""

# 步骤4: 安装后端依赖
echo -e "${YELLOW}[4/6] 安装后端依赖...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
    npm install
fi
echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
echo ""

# 步骤5: 启动后端服务
echo -e "${YELLOW}[5/6] 启动后端服务...${NC}"

# 检查是否安装了 PM2
if command -v pm2 &> /dev/null; then
    echo "使用 PM2 启动后端服务..."
    pm2 delete LabPage_backend 2>/dev/null || true
    pm2 start server.js --name LabPage_backend
    pm2 save
    echo -e "${GREEN}✓ 后端服务已通过 PM2 启动${NC}"
else
    echo -e "${YELLOW}提示: 未安装 PM2，建议安装以便更好地管理后端服务${NC}"
    echo "安装命令: npm install -g pm2"
    echo "请手动启动后端: cd backend && npm start"
fi
echo ""

# 步骤6: 重启 Nginx
echo -e "${YELLOW}[6/6] 重启 Nginx...${NC}"

# 测试 Nginx 配置
if sudo nginx -t; then
    sudo brew services restart nginx
    echo -e "${GREEN}✓ Nginx 已重启${NC}"
else
    echo -e "${RED}错误: Nginx 配置有误，请检查配置文件${NC}"
    exit 1
fi
echo ""

# 完成
echo "======================================"
echo -e "${GREEN}   部署完成！${NC}"
echo "======================================"
echo ""
echo "访问地址："
echo "  - 前端网站: http://localhost"
echo "  - 管理后台: http://localhost/admin"
echo "  - 后端API:  http://localhost/api"
echo ""
echo "默认管理员账号："
echo "  - 用户名: admin"
echo "  - 密码: admin123"
echo ""
echo -e "${YELLOW}提示: 使用 cpolar 配置内网穿透${NC}"
echo "  命令: cpolar http 80"
echo "  或使用固定域名: cpolar http -subdomain=你的域名 80"
echo ""
echo "查看服务状态："
echo "  - Nginx: sudo brew services list"
echo "  - 后端: pm2 status"
echo ""

