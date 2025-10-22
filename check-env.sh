#!/bin/bash

# 环境检查脚本
# 用于检查部署前的环境是否就绪

echo "======================================"
echo "   环境检查工具"
echo "======================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ 未安装${NC}"
fi

# 检查npm
echo -n "检查 npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ 未安装${NC}"
fi

# 检查MySQL
echo -n "检查 MySQL... "
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | awk '{print $5}' | sed 's/,//')
    echo -e "${GREEN}✓ $MYSQL_VERSION${NC}"
    
    # 检查MySQL是否运行
    if brew services list | grep mysql | grep started > /dev/null; then
        echo -e "  ${GREEN}→ MySQL 服务正在运行${NC}"
    else
        echo -e "  ${YELLOW}⚠ MySQL 服务未运行${NC}"
        echo "    启动命令: brew services start mysql"
    fi
else
    echo -e "${RED}✗ 未安装${NC}"
fi

# 检查Nginx
echo -n "检查 Nginx... "
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk '{print $3}')
    echo -e "${GREEN}✓ $NGINX_VERSION${NC}"
    
    # 检查Nginx配置
    if sudo nginx -t &> /dev/null; then
        echo -e "  ${GREEN}→ Nginx 配置正确${NC}"
    else
        echo -e "  ${RED}⚠ Nginx 配置有误${NC}"
        echo "    检查命令: sudo nginx -t"
    fi
    
    # 检查Nginx是否运行
    if brew services list | grep nginx | grep started > /dev/null; then
        echo -e "  ${GREEN}→ Nginx 服务正在运行${NC}"
    else
        echo -e "  ${YELLOW}⚠ Nginx 服务未运行${NC}"
        echo "    启动命令: sudo brew services start nginx"
    fi
else
    echo -e "${RED}✗ 未安装${NC}"
fi

# 检查Apache（应该停止）
echo -n "检查 Apache... "
if command -v apachectl &> /dev/null; then
    if sudo apachectl status &> /dev/null; then
        echo -e "${YELLOW}⚠ Apache 正在运行（可能占用80端口）${NC}"
        echo "    建议停止: sudo apachectl stop"
    else
        echo -e "${GREEN}✓ 未运行${NC}"
    fi
else
    echo -e "${GREEN}✓ 未安装${NC}"
fi

# 检查Cpolar
echo -n "检查 Cpolar... "
if command -v cpolar &> /dev/null; then
    CPOLAR_VERSION=$(cpolar version 2>&1 | head -1)
    echo -e "${GREEN}✓ $CPOLAR_VERSION${NC}"
else
    echo -e "${RED}✗ 未安装${NC}"
fi

# 检查PM2
echo -n "检查 PM2... "
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓ v$PM2_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ 未安装（推荐安装）${NC}"
    echo "    安装命令: npm install -g pm2"
fi

echo ""
echo "======================================"
echo "   端口检查"
echo "======================================"
echo ""

# 检查80端口
echo -n "端口 80 (Nginx)... "
if sudo lsof -i :80 &> /dev/null; then
    PROCESS=$(sudo lsof -i :80 | grep LISTEN | awk '{print $1}' | head -1)
    if [ "$PROCESS" = "nginx" ]; then
        echo -e "${GREEN}✓ Nginx 正在监听${NC}"
    else
        echo -e "${YELLOW}⚠ 被 $PROCESS 占用${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 未被监听${NC}"
fi

# 检查5080端口
echo -n "端口 5080 (后端)... "
if lsof -i :5080 &> /dev/null; then
    PROCESS=$(lsof -i :5080 | grep LISTEN | awk '{print $1}' | head -1)
    echo -e "${GREEN}✓ $PROCESS 正在监听${NC}"
else
    echo -e "${YELLOW}⚠ 未被监听（后端未启动）${NC}"
fi

echo ""
echo "======================================"
echo "   项目文件检查"
echo "======================================"
echo ""

PROJECT_DIR="/Users/zhangqi/Desktop/实验室建站/2框架测试/LabPage"

# 检查前端构建
echo -n "前端构建文件... "
if [ -f "$PROJECT_DIR/frontend/dist/index.html" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${YELLOW}⚠ 未构建${NC}"
    echo "    构建命令: cd frontend && npm run build"
fi

# 检查管理后台构建
echo -n "管理后台构建文件... "
if [ -f "$PROJECT_DIR/admin/dist/index.html" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${YELLOW}⚠ 未构建${NC}"
    echo "    构建命令: cd admin && npm run build"
fi

# 检查后端配置
echo -n "后端配置文件... "
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
elif [ -f "$PROJECT_DIR/backend/config.js" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${YELLOW}⚠ 未配置${NC}"
    echo "    需要配置数据库连接信息"
fi

# 检查uploads目录
echo -n "上传文件目录... "
if [ -d "$PROJECT_DIR/backend/uploads" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${YELLOW}⚠ 不存在${NC}"
    echo "    创建命令: mkdir -p backend/uploads"
fi

echo ""
echo "======================================"
echo "   建议"
echo "======================================"
echo ""

ISSUES=0

# 汇总问题
if ! brew services list | grep mysql | grep started > /dev/null; then
    echo -e "${YELLOW}→ 启动 MySQL: brew services start mysql${NC}"
    ISSUES=$((ISSUES+1))
fi

if sudo apachectl status &> /dev/null; then
    echo -e "${YELLOW}→ 停止 Apache: sudo apachectl stop${NC}"
    ISSUES=$((ISSUES+1))
fi

if ! brew services list | grep nginx | grep started > /dev/null; then
    echo -e "${YELLOW}→ 启动 Nginx: sudo brew services start nginx${NC}"
    ISSUES=$((ISSUES+1))
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}→ 安装 PM2: npm install -g pm2${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ ! -f "$PROJECT_DIR/frontend/dist/index.html" ]; then
    echo -e "${YELLOW}→ 构建前端: cd frontend && npm run build${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ ! -f "$PROJECT_DIR/admin/dist/index.html" ]; then
    echo -e "${YELLOW}→ 构建管理后台: cd admin && npm run build${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ 环境就绪！可以运行 ./deploy.sh 进行部署${NC}"
else
    echo ""
    echo -e "${YELLOW}发现 $ISSUES 个待处理项，请先解决后再部署${NC}"
fi

echo ""



