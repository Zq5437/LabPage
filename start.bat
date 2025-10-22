@echo off
chcp 65001 >nul
title 实验室网站启动器

echo 🚀 启动实验室网站项目...
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告: 未找到MySQL，请确保MySQL已安装并运行
    echo    如果已安装，请检查PATH环境变量
)

:: 检查是否为首次运行
if not exist "backend\node_modules" (
    echo 📦 首次运行，正在安装依赖...
    
    echo 📦 安装后端依赖...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    
    echo 📦 安装前端依赖...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    
    echo 📦 安装管理端依赖...
    cd admin
    call npm install
    if errorlevel 1 (
        echo ❌ 管理端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    
    echo ✅ 所有依赖安装完成
)

:: 检查环境变量配置
if not exist "backend\.env" (
    echo ⚠️  警告: 未找到环境变量配置文件
    echo    请将 backend\.env.example 复制为 backend\.env 并修改配置
    copy "backend\.env.example" "backend\.env" >nul
    echo    已创建默认配置文件，请修改 backend\.env 中的数据库密码和JWT密钥
)

echo.
echo 📋 初始化步骤：
echo    1. 确保MySQL服务已启动
echo    2. 修改 backend\.env 中的数据库密码和JWT密钥
echo    3. 执行: mysql -u root -p ^< database\schema.sql
echo.

echo 🎯 启动所有服务...

:: 启动后端服务
echo 🔧 启动后端服务 (端口: 5080)...
cd backend
start "后端服务" cmd /k "npm run dev"
cd ..

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端服务
echo 🖥️  启动前端服务 (端口: 5173)...
cd frontend
start "前端服务" cmd /k "set NODE_OPTIONS=--no-deprecation && npm run dev"
cd ..

:: 启动管理端服务
echo ⚙️  启动管理端服务 (端口: 5174)...
cd admin
start "管理端服务" cmd /k "set NODE_OPTIONS=--no-deprecation && npm run dev"
cd ..

:: 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 所有服务已启动！
echo.
echo 📍 访问地址:
echo    前端网站:    http://localhost:5173
echo    管理后台:    http://localhost:5174
echo    后端API:     http://localhost:5080
echo.
echo 👤 默认管理员账号:
echo    用户名: admin
echo    密码:   admin123
echo.
echo 💡 提示:
echo    - 关闭相应的命令行窗口来停止服务
echo    - 确保MySQL服务已启动并导入了数据库结构
echo    - 如遇到问题，请检查各服务窗口的日志输出
echo.

:: 打开浏览器
echo 🌐 正在打开浏览器...
start http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:5174

echo 按任意键退出启动器...
pause >nul
