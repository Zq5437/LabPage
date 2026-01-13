# Node.js 安装教程
本文档介绍安装 Node.js 的方法。
参考链接：https://nodejs.org/zh-cn/download
## 确认是否已经安装好
```shell
node -v
```
如果已经安装好，会显示版本号，否则会提示 `command not found`。

## MacOs & Linux
```shell
# 下载并安装 nvm（下面这个命令执行好后会自动添加环境变量）：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 代替重启 shell
\. "$HOME/.nvm/nvm.sh"

# 下载并安装 Node.js：
nvm install 24

# 验证 Node.js 版本：
node -v # Should print "v24.12.0".

# 验证 npm 版本：
npm -v # Should print "11.6.2".
```

## Windows
```shell
# 下载并安装 Chocolatey：
powershell -c "irm https://community.chocolatey.org/install.ps1|iex"

# 下载并安装 Node.js：
choco install nodejs --version="24.12.0"

# 验证 Node.js 版本：
node -v # Should print "v24.12.0".

# 验证 npm 版本：
npm -v # Should print "11.6.2".
```