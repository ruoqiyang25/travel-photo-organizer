# 🌐 部署指南 - 让所有人都能访问你的应用

## 🎯 部署方案对比

### ⭐ 推荐方案

| 平台 | 难度 | 价格 | 速度 | 推荐度 |
|------|------|------|------|--------|
| **Vercel** | ⭐ | 免费 | ⚡️⚡️⚡️ | ⭐⭐⭐⭐⭐ |
| **Railway** | ⭐⭐ | $5/月起 | ⚡️⚡️⚡️ | ⭐⭐⭐⭐⭐ |
| **Render** | ⭐⭐ | 免费/$7/月 | ⚡️⚡️ | ⭐⭐⭐⭐ |
| **阿里云/腾讯云** | ⭐⭐⭐ | ¥50/月起 | ⚡️⚡️⚡️ | ⭐⭐⭐ |

---

## 🚀 方案1：Vercel（最简单，推荐）

### 优点
- ✅ 完全免费
- ✅ 自动SSL证书（HTTPS）
- ✅ 全球CDN加速
- ✅ 一键部署
- ✅ 支持自定义域名

### 缺点
- ⚠️ 免费版有限制（10秒超时）
- ⚠️ 适合前端为主的应用

### 部署步骤

#### 1. 准备项目

创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "VIDEO_SERVICE": "sora",
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

#### 2. 部署到Vercel

**方法A：通过 Vercel CLI（推荐）**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 设置环境变量
vercel env add OPENAI_API_KEY production
# 输入你的 API Key

# 生产环境部署
vercel --prod
```

**方法B：通过 GitHub + Vercel 网站**

1. 将代码推送到 GitHub
2. 访问 https://vercel.com
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 添加环境变量：
   - `VIDEO_SERVICE=sora`
   - `OPENAI_API_KEY=你的密钥`
6. 点击 "Deploy"

#### 3. 完成！

- 你会获得一个域名：`https://your-app.vercel.app`
- 可以绑定自定义域名

---

## 🚂 方案2：Railway（最推荐，功能强大）

### 优点
- ✅ 支持完整的 Node.js 应用
- ✅ 自动SSL证书
- ✅ 数据库支持
- ✅ 永久运行
- ✅ 简单易用

### 价格
- 免费：$5 信用额度/月
- 付费：$5/月起

### 部署步骤

#### 1. 创建配置文件

创建 `railway.json`（可选）：
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

创建 `Procfile`：
```
web: npm start
```

#### 2. 部署

**方法A：通过 Railway CLI**

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加环境变量
railway variables set VIDEO_SERVICE=sora
railway variables set OPENAI_API_KEY=你的密钥
railway variables set PORT=3000

# 部署
railway up
```

**方法B：通过 GitHub + Railway 网站**

1. 访问 https://railway.app
2. 注册/登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的仓库
6. 添加环境变量
7. 自动部署

#### 3. 获取域名

- Railway 会自动分配域名
- 可以绑定自定义域名

---

## 🎨 方案3：Render（免费+稳定）

### 优点
- ✅ 有免费tier
- ✅ 自动SSL
- ✅ 持续部署
- ✅ 数据库支持

### 缺点
- ⚠️ 免费版会在15分钟无活动后休眠
- ⚠️ 冷启动较慢（30秒）

### 部署步骤

#### 1. 创建配置文件

创建 `render.yaml`：
```yaml
services:
  - type: web
    name: travel-photo-organizer
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: VIDEO_SERVICE
        value: sora
      - key: OPENAI_API_KEY
        sync: false
```

#### 2. 部署

1. 访问 https://render.com
2. 注册/登录
3. 点击 "New +"
4. 选择 "Web Service"
5. 连接 GitHub 仓库
6. 配置：
   - Build Command: `npm install`
   - Start Command: `npm start`
7. 添加环境变量
8. 点击 "Create Web Service"

---

## ☁️ 方案4：阿里云/腾讯云（国内访问快）

### 优点
- ✅ 国内访问速度快
- ✅ 无限制
- ✅ 可以备案
- ✅ 完全控制

### 缺点
- ⚠️ 需要购买服务器
- ⚠️ 配置相对复杂
- ⚠️ 需要备案（使用域名的话）

### 部署步骤

#### 1. 购买服务器

**推荐配置：**
- CPU: 1核
- 内存: 2GB
- 带宽: 1M
- 系统: Ubuntu 22.04
- 价格: ¥50-100/月

#### 2. 连接服务器

```bash
ssh root@你的服务器IP
```

#### 3. 安装环境

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 PM2（进程管理器）
npm install -g pm2

# 安装 Nginx（反向代理）
apt install -y nginx
```

#### 4. 部署应用

```bash
# 创建应用目录
mkdir -p /var/www/travel-app
cd /var/www/travel-app

# 上传代码（使用 git）
git clone https://github.com/你的用户名/你的仓库.git .

# 或者使用 scp 上传
# scp -r /path/to/your/app root@服务器IP:/var/www/travel-app

# 安装依赖
npm install

# 创建 .env 文件
nano .env
# 填入：
# VIDEO_SERVICE=sora
# OPENAI_API_KEY=你的密钥
# PORT=3000

# 使用 PM2 启动
pm2 start server.js --name travel-app
pm2 save
pm2 startup
```

#### 5. 配置 Nginx

```bash
# 创建 Nginx 配置
nano /etc/nginx/sites-available/travel-app

# 填入：
server {
    listen 80;
    server_name 你的域名或IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
ln -s /etc/nginx/sites-available/travel-app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. 配置 SSL（可选但推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d 你的域名

# 自动续期
certbot renew --dry-run
```

---

## 🔒 安全注意事项

### 1. 保护 API 密钥
```javascript
// 在 server.js 中添加访问限制
app.use((req, res, next) => {
    // 可以添加用户认证
    // 可以添加请求频率限制
    next();
});
```

### 2. 添加速率限制

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10, // 最多10个请求
    message: '请求过于频繁，请稍后再试'
});

app.use('/api/generate-video', limiter);
```

### 3. 成本控制

**建议：**
- 设置每日/每月预算
- 添加用户认证（防止滥用）
- 限制每个用户的使用次数
- 监控 API 使用情况

---

## 💰 成本估算

### Sora API 成本
- 每个视频：$5-10（10张照片×5秒）
- 如果100人使用，每人生成1个视频：$500-1,000

### 服务器成本
- **Vercel**: 免费
- **Railway**: $5/月 + API费用
- **Render**: 免费（有限制）或 $7/月
- **阿里云**: ¥50-100/月 + API费用

### 建议策略
1. **开始阶段**：使用 Vercel/Railway 免费版测试
2. **收费模式**：
   - 用户付费使用
   - 每个视频收费 ¥30-50
   - 或者限制免费用户使用次数

---

## 📱 域名绑定

### 购买域名
- **国际域名**: Namecheap, GoDaddy ($10-15/年)
- **国内域名**: 阿里云, 腾讯云 (¥50-100/年)

### 绑定到平台
- **Vercel**: 在 Vercel 控制台添加域名
- **Railway**: 在设置中添加自定义域名
- **Render**: 在设置中添加自定义域名
- **自建服务器**: 修改域名DNS指向服务器IP

---

## 🎯 推荐方案（按需求）

### 1. 个人项目/测试
**推荐: Vercel**
- 完全免费
- 快速部署
- 适合展示

### 2. 小规模使用（<100用户/天）
**推荐: Railway**
- $5/月
- 稳定可靠
- 容易管理

### 3. 商业项目（>100用户/天）
**推荐: 阿里云 + 用户付费**
- 可控成本
- 国内访问快
- 可以备案

### 4. 国际项目
**推荐: Railway + Cloudflare**
- 全球加速
- 稳定性好
- 价格合理

---

## 🚀 快速开始（Railway 推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化
railway init

# 4. 设置环境变量
railway variables set VIDEO_SERVICE=sora
railway variables set OPENAI_API_KEY=你的密钥

# 5. 部署
railway up

# 6. 打开应用
railway open
```

**5分钟后，你的应用就在线了！🎉**

---

## 📞 需要帮助？

有任何问题，可以：
1. 查看平台的官方文档
2. 在 GitHub Issues 提问
3. 加入技术社区讨论

**祝你部署顺利！🚀**
