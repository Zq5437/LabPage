# GitHub Pages部署手把手教程
本文档从0到1，手把手教你如何将本项目部署并运行到GitHub Pages上。

## 运行前检查
如果以下条件不满足，请点击跳转到相应文档安装
- [Node.js 16.0+](../prerequisite_wiki/INSTALL_NODEJS.md)
- [MySQL 8.0+](../prerequisite_wiki/INSTALL_MYSQL.md)

## 下载项目
```shell
git clone https://github.com/Zq5437/LabPage.git
```

## 基础配置
### backend/.env
在根目录下的 backend 文件夹中，`.env.example`复制一份到同级目录下，并命名为`.env`
主要修改以下两项：
```shell
DB_USER=root # MySQL用户名（一般就是root，更安全的情况就自己选择用户，控制权限）
DB_PASSWORD=your_mysql_password # MySQL密码
```

### 创建数据库
在根目录下，执行下面的命令后，输入mysql的密码，即可创建数据库：
```shell
# -u 后面接的是用户名，-p 表示需要输入密码，database/schema.sql 是要数据库创建的sql文件
mysql -u root -p < database/schema.sql
```


## 一键初始化/启动
在根目录下，执行以下命令：
### Linux/Mac系统：
```bash
# 给脚本执行权限(执行一次即可)
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### Windows系统：
```batch
:: 直接双击运行或在命令行执行
start.bat
```