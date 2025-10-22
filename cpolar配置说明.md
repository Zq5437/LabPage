# Cpolar 内网穿透配置说明

## 📖 什么是 Cpolar

Cpolar 是一个内网穿透工具，可以将你本地运行的服务暴露到公网，让外网用户也能访问。

## 🚀 快速开始

### 1. 基础使用（临时地址）

```bash
# 穿透本地 80 端口
cpolar http 80
```

运行后会显示类似输出：
```
Forwarding http://xxxx.cpolar.cn -> http://localhost:80
```

这个 `xxxx.cpolar.cn` 就是你的临时公网地址，直接访问即可。

### 2. 使用固定域名（推荐）

如果你已经在 cpolar 后台申请了固定域名（如 `mylab`），可以使用：

```bash
# 使用固定二级域名
cpolar http -subdomain=mylab 80

# 或使用配置文件（见下文）
cpolar start lab-website
```

固定域名的好处：
- 地址不会变化，便于分享
- 可以配置自定义域名
- 更专业的展示

## 📝 配置文件方式（推荐）

### 1. 创建配置文件

编辑 cpolar 配置文件：

```bash
# Mac/Linux
vim ~/.cpolar/cpolar.yml

# Windows  
notepad %USERPROFILE%\.cpolar\cpolar.yml
```

### 2. 添加配置

在配置文件中添加：

```yaml
authtoken: 你的authtoken  # 从cpolar后台获取

tunnels:
  lab-website:
    addr: 80
    proto: http
    # 如果有固定域名，添加下面这行
    subdomain: mylab  # 替换为你的固定域名
    # 可选：绑定地区
    region: cn_vip
```

### 3. 启动隧道

```bash
# 启动名为 lab-website 的隧道
cpolar start lab-website

# 或启动所有隧道
cpolar start-all
```

## 🔧 高级配置

### 同时穿透多个端口

如果你需要同时穿透多个服务，可以配置：

```yaml
tunnels:
  lab-website:
    addr: 80
    proto: http
    subdomain: mylab
    
  LabPage_backend:
    addr: 5080
    proto: http
    subdomain: mylab-api
```

启动：
```bash
cpolar start-all
```

### 配置 HTTPS

cpolar 免费版已自动支持 HTTPS，无需额外配置。

访问地址会同时提供：
- http://mylab.cpolar.cn
- https://mylab.cpolar.cn

## 🔐 安全建议

1. **不要分享 authtoken**：这是你的认证凭证
2. **设置访问密码**（可选）：
   ```yaml
   tunnels:
     lab-website:
       addr: 80
       proto: http
       auth: "用户名:密码"
   ```
3. **限制访问IP**（付费版功能）

## 📊 监控和管理

### Web 管理界面

cpolar 启动后会提供一个本地管理界面：

```
http://localhost:9200
```

在这里可以查看：
- 当前活跃的隧道
- 访问日志
- 请求统计
- 实时流量

### 命令行查看状态

```bash
# 查看版本
cpolar version

# 查看配置
cpolar config check

# 查看隧道状态  
cpolar status
```

## 🎯 后台运行

### Mac/Linux (使用 screen)

```bash
# 创建新会话
screen -S cpolar

# 启动 cpolar
cpolar http 80

# 按 Ctrl+A 然后按 D 分离会话

# 重新连接
screen -r cpolar

# 查看所有会话
screen -ls

# 关闭会话
screen -X -S cpolar quit
```

### Mac/Linux (使用 nohup)

```bash
# 后台运行
nohup cpolar http 80 > cpolar.log 2>&1 &

# 查看日志
tail -f cpolar.log

# 停止服务
ps aux | grep cpolar
kill [进程号]
```

### 使用系统服务（推荐）

创建 LaunchAgent (Mac):

```bash
# 创建配置文件
cat > ~/Library/LaunchAgents/com.cpolar.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cpolar</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cpolar</string>
        <string>start-all</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# 加载服务
launchctl load ~/Library/LaunchAgents/com.cpolar.plist

# 卸载服务
launchctl unload ~/Library/LaunchAgents/com.cpolar.plist
```

## 💡 常见问题

### 1. 提示 "authtoken 无效"

重新获取 authtoken：
1. 登录 cpolar.com
2. 进入"验证"页面
3. 复制 authtoken
4. 运行：`cpolar authtoken 你的token`

### 2. 域名被占用

- 临时域名：刷新重新获取
- 固定域名：检查是否有其他进程在使用

### 3. 连接不稳定

- 检查网络连接
- 尝试更换节点：`region: cn` 或 `region: us`
- 升级到付费版获得更稳定的服务

### 4. 访问速度慢

- 使用国内节点
- 升级到 VIP 版本
- 考虑使用其他内网穿透工具（frp、ngrok等）

## 📱 移动端访问

cpolar 穿透后，可以通过手机访问：

1. 确保手机能上网
2. 在手机浏览器输入 cpolar 提供的地址
3. 如果配置了 HTTPS，建议使用 https 访问

## 🔄 自动重启

添加到部署脚本中：

```bash
# 在 deploy.sh 最后添加
echo "启动 cpolar 内网穿透..."
cpolar http 80 &
```

或使用配置文件方式：

```bash
cpolar start lab-website &
```

## 📞 获取帮助

- 官方文档：https://www.cpolar.com/docs
- 后台管理：https://dashboard.cpolar.com
- Web 界面：http://localhost:9200

## 💰 版本对比

| 功能 | 免费版 | VIP版 |
|------|--------|-------|
| 临时隧道 | ✅ | ✅ |
| 固定域名 | 有限 | ✅ |
| 自定义域名 | ❌ | ✅ |
| 带宽 | 1Mbps | 10Mbps+ |
| 并发连接 | 2个 | 无限制 |
| TCP隧道 | ❌ | ✅ |

根据你的需求选择合适的版本。对于实验室网站展示，免费版通常已经足够。

