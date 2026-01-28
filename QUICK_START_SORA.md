# ⚡ 快速开始使用 Sora

## 🎯 3步开始使用

### 步骤1️⃣：获取 OpenAI API Key

访问：**https://platform.openai.com/api-keys**

1. 注册/登录 OpenAI 账号
2. 点击 "Create new secret key"
3. 复制密钥（格式：`sk-proj-...`）
4. 充值账户（建议 $20-50）

### 步骤2️⃣：配置密钥

编辑 `.env` 文件，将你的API密钥填入：

```bash
OPENAI_API_KEY=sk-proj-你的真实密钥
```

**完整示例：**
```bash
VIDEO_SERVICE=sora
OPENAI_API_KEY=sk-proj-abc123xyz789defghijk...
PORT=3000
```

### 步骤3️⃣：重启服务器

```bash
# 按 Ctrl+C 停止当前服务器
# 然后运行：
npm start
```

看到这个表示成功：
```
🚀 服务器运行在 http://localhost:3000
📹 视频生成服务: sora
🔑 API配置状态: ✅ 已配置
```

---

## 🎬 开始使用

1. 打开浏览器：http://localhost:3000
2. 上传旅行照片（5-15张）
3. 滑动整理照片
4. 选择视频风格
5. 点击"生成视频"
6. 等待60-120秒
7. 下载你的AI旅行故事视频！

---

## 💰 价格参考

- 10张照片 × 5秒 = 50秒视频
- 预估费用：**$5-10**

---

## 📚 详细文档

- **完整指南**: `SORA_SETUP_GUIDE.md`
- **服务对比**: `AI_MODELS_COMPARISON.md`

---

**准备好了吗？立即获取你的 API Key 开始创作！🚀**
