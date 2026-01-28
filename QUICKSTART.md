# 快速启动指南 🚀

## 第一次使用？跟着这个指南 3 分钟快速启动！

### 步骤 1: 安装依赖 📦

打开终端，进入项目目录：
```bash
cd /Users/ruoqi/Desktop/hackathon
npm install
```

### 步骤 2: 配置 API 密钥 🔑

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 获取 API 密钥（选择一个）：
   - **Kling AI**（推荐）: https://www.newapi.ai/
   - **即梦 AI**: https://www.volcengine.com/
   - **Runway**: https://runwayml.com/

3. 编辑 `.env` 文件：
```bash
open .env
```

填入你的 API 密钥：
```env
VIDEO_SERVICE=kling
KLING_API_KEY=sk-xxxxxxxxxxxxxxxx
PORT=3000
```

### 步骤 3: 启动服务器 ▶️

```bash
npm start
```

看到这个信息就成功了：
```
🚀 服务器运行在 http://localhost:3000
📹 视频生成服务: kling
🔑 API配置状态: ✅ 已配置
```

### 步骤 4: 打开浏览器 🌐

访问：http://localhost:3000

### 步骤 5: 开始使用 📸

1. 点击"选择照片"上传你的旅行照片
2. 向右滑保留，向左滑删除
3. 整理完成后，配置视频风格
4. 点击"生成旅行视频"
5. 等待 AI 生成流畅的视频
6. 下载并分享你的旅行视频！

## 📱 在手机上测试

1. 查看你的电脑 IP 地址：
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. 在手机浏览器访问：`http://你的IP:3000`

3. 像刷抖音一样整理照片！

## ⚠️ 常见问题

### 问：服务器启动失败？
答：确保已安装 Node.js 14+ 版本
```bash
node --version
```

### 问：视频生成失败？
答：检查 API 密钥是否正确配置：
```bash
cat .env
```

### 问：无法连接后端服务？
答：确保服务器正在运行，检查端口 3000 是否被占用

### 问：没有 API 密钥？
答：可以先使用应用的照片整理功能，视频生成需要配置 API 密钥

## 💰 API 费用说明

- Kling AI: 按次计费，新用户通常有免费额度
- 即梦 AI: 火山引擎服务，有免费额度
- Runway: 专业服务，有订阅套餐

建议先从 Kling AI 开始，性价比高且效果好。

## 🎉 开始享受吧！

现在你可以开始整理你的旅行照片，并生成专业的旅行视频了！

有问题？查看 [README.md](./README.md) 了解更多详情。
