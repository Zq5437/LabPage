#!/bin/bash

# 实验室网站启动脚本
echo "🚀 启动实验室网站项目..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查MySQL是否运行
if ! command -v mysql &> /dev/null; then
    echo "⚠️  警告: 未找到MySQL，请确保MySQL已安装并运行"
    echo "   如果已安装，请检查PATH环境变量"
fi

# 检查是否为首次运行
if [ ! -f "backend/node_modules/.package-lock.json" ] || [ ! -f "frontend/node_modules/.package-lock.json" ] || [ ! -f "admin/node_modules/.package-lock.json" ]; then
    echo "📦 首次运行，正在安装依赖..."
    
    # 安装后端依赖
    echo "📦 安装后端依赖..."
    cd backend && npm install
    if [ $? -ne 0 ]; then
        echo "❌ 后端依赖安装失败"
        exit 1
    fi
    cd ..
    
    # 安装前端依赖
    echo "📦 安装前端依赖..."
    cd frontend && npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
    cd ..
    
    # 安装管理端依赖
    echo "📦 安装管理端依赖..."
    cd admin && npm install
    if [ $? -ne 0 ]; then
        echo "❌ 管理端依赖安装失败"
        exit 1
    fi
    cd ..
    
    echo "✅ 所有依赖安装完成"
fi

# 检查数据库配置
if [ ! -f "backend/config.js" ]; then
    echo "⚠️  警告: 未找到数据库配置文件"
    echo "   请将 backend/config.example.js 复制为 backend/config.js 并修改数据库配置"
    cp backend/config.example.js backend/config.js
    echo "   已创建默认配置文件，请修改其中的数据库密码"
fi

# 提示数据库初始化
echo ""
echo "📋 数据库初始化步骤："
echo "   1. 确保MySQL服务已启动"
echo "   2. 修改 backend/config.js 中的数据库配置"
echo "   3. 执行: mysql -u root -p < database/schema.sql"
echo ""

# 启动服务
echo "🎯 启动所有服务..."

# 使用trap捕获退出信号，优雅关闭所有进程
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 启动后端服务
echo "🔧 启动后端服务 (端口: 5080)..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo "🖥️  启动前端服务 (端口: 5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# 启动管理端服务
echo "⚙️  启动管理端服务 (端口: 5174)..."
(cd admin && npm run dev) &
ADMIN_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "🎉 所有服务已启动！"
echo ""
echo "📍 访问地址:"
echo "   前端网站:    http://localhost:5173"
echo "   管理后台:    http://localhost:5174"
echo "   后端API:     http://localhost:5080"
echo ""
echo "👤 默认管理员账号:"
echo "   用户名: admin"
echo "   密码:   admin123"
echo ""
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 确保MySQL服务已启动并导入了数据库结构"
echo "   - 如遇到问题，请检查各服务的日志输出"
echo ""

# 等待用户中断
wait