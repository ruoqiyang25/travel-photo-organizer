# 🎬 OpenAI Sora 2 集成指南

## ✨ 已完成的集成

你的旅行照片整理器现在已经支持 **OpenAI Sora 2** - 最先进的AI图生视频技术！

---

## 🔑 步骤1：获取OpenAI API Key

### 方法A：官方渠道（推荐）

1. **访问 OpenAI 官网**
   - 网址：https://platform.openai.com/signup
   
2. **注册/登录账号**
   - 使用邮箱注册
   - 完成邮箱验证

3. **获取API密钥**
   - 登录后访问：https://platform.openai.com/api-keys
   - 点击 "Create new secret key"
   - 复制生成的密钥（格式：`sk-proj-...` 或 `sk-...`）
   - ⚠️ **重要**：密钥只显示一次，请妥善保存

4. **充值账户**
   - 访问：https://platform.openai.com/account/billing
   - 添加支付方式
   - 建议充值 $20-50 用于测试

### 方法B：第三方API服务（更便宜）

如果官方API较贵，可以使用第三方服务：

**推荐服务：**
- **fal.ai**: https://fal.ai/models/google/veo-3
- **Replicate**: https://replicate.com/openai/sora-2
- **AIML API**: https://aimlapi.com

---

## ⚙️ 步骤2：配置API密钥

打开项目根目录下的 `.env` 文件，添加/修改以下内容：

```bash
# 视频生成服务选择
VIDEO_SERVICE=sora

# OpenAI Sora API密钥
OPENAI_API_KEY=sk-proj-your_actual_api_key_here
```

**完整示例：**
```bash
# 视频生成服务选择 (sora, kling, runway, jimeng)
VIDEO_SERVICE=sora

# OpenAI Sora API密钥（推荐）
OPENAI_API_KEY=sk-proj-abc123xyz789...

# 其他服务（可选，不用也可以）
KLING_API_KEY=your_kling_api_key_here
RUNWAY_API_KEY=your_runway_api_key_here
JIMENG_API_KEY=your_jimeng_api_key_here

# 服务器端口
PORT=3000
```

---

## 🚀 步骤3：重启服务器

**如果服务器正在运行：**
1. 按 `Ctrl + C` 停止当前服务器
2. 运行：`npm start`

**如果服务器未运行：**
```bash
npm start
```

**看到以下信息表示成功：**
```
🚀 服务器运行在 http://localhost:3000
📹 视频生成服务: sora
🔑 API配置状态: ✅ 已配置
```

---

## 🎨 步骤4：使用Sora生成视频

### 在浏览器中使用：

1. **打开网页**
   - 电脑：http://localhost:3000
   - 手机：http://172.20.10.9:3000

2. **上传旅行照片**
   - 点击"上传照片"按钮
   - 选择 5-20 张旅行照片
   - 支持 JPG、PNG、WebP 格式

3. **滑动整理照片**
   - 👉 **向右滑**：保留这张照片
   - 👈 **向左滑**：删除这张照片
   - 或使用底部按钮操作

4. **配置视频风格**
   - **风格选择**：
     - 🎬 电影感（Cinematic）- 适合风景大片
     - 📱 Vlog风格 - 适合日常记录
     - 💭 回忆录（Memories）- 适合怀旧氛围
     - ⚡ 动感快节奏 - 适合冒险旅行
   
   - **音乐氛围**：
     - 🌊 平和宁静
     - 🏔️ 冒险刺激
     - 💕 浪漫温馨
     - 🔥 充满活力

5. **生成视频**
   - 点击"生成视频"按钮
   - Sora会使用第一张照片作为起始帧
   - 生成时间：约 60-120 秒
   - 可以看到实时进度

6. **下载视频**
   - 生成完成后自动播放预览
   - 点击"下载视频"保存到本地
   - 视频格式：MP4
   - 分辨率：1280x720（高清）

---

## 💰 价格与成本

### OpenAI Sora 官方定价

根据2026年最新信息：
- 价格：尚未公开官方定价
- 预计：$0.10-0.20 每秒视频（基于市场对比）

### 成本估算示例

**生成一个旅行视频：**
- 使用照片数：10张
- 每张生成：5秒视频
- 总时长：50秒
- **预估费用**：$5-10

**优化建议：**
- 精选照片，不要上传太多
- 5-15张照片最佳
- 每张照片生成5秒视频效果最好

---

## 🎯 Sora的优势

### ✅ 为什么选择Sora？

1. **最先进的技术**
   - OpenAI 最新图生视频模型
   - 物理真实性最强
   - 画面流畅度最高

2. **故事性最强**
   - 能理解复杂的叙事结构
   - 自动生成有逻辑的镜头运动
   - 适合制作有故事性的旅行视频

3. **图生视频功能**
   - 支持使用照片作为第一帧
   - 保持照片原有构图和风格
   - 自然的动态效果

4. **高质量输出**
   - 支持高清分辨率（1280x720）
   - 可选择 sora-2 或 sora-2-pro 模型
   - 专业级别的画质

---

## 🔧 技术细节

### API调用流程

1. **上传照片** → 转换为 Buffer
2. **生成提示词** → 根据风格自动生成
3. **调用Sora API** → 提交图生视频任务
4. **轮询状态** → 每5秒检查一次进度
5. **下载视频** → 完成后自动下载

### 提示词示例

系统会根据你选择的风格自动生成提示词：

**电影感风格：**
```
电影级别的画质，平滑的摄像机运动，专业色彩校正，戏剧性的光线变化。
缓慢推进。宁静祥和，放松的氛围。旅行视频，画面流畅自然。
```

**Vlog风格：**
```
第一人称视角，自然的手持感，真实的色彩，温暖的氛围。
快速切换。冒险刺激，充满活力。旅行视频，画面流畅自然。
```

---

## 🐛 常见问题

### Q1: API密钥无效？
**A:** 
- 检查密钥格式：应该是 `sk-proj-...` 或 `sk-...`
- 确认密钥已复制完整
- 检查OpenAI账户是否已充值

### Q2: 生成速度慢？
**A:** 
- Sora需要60-120秒生成视频，这是正常的
- 可以在等待时继续整理其他照片
- Pro模型（sora-2-pro）会更慢但质量更好

### Q3: 生成失败？
**A:** 
- 检查网络连接
- 确认账户余额充足
- 查看控制台错误信息
- 可能是OpenAI服务暂时不可用

### Q4: 照片太大上传失败？
**A:** 
- 建议照片大小不超过 5MB
- 可以使用图片压缩工具
- 推荐分辨率：1920x1080 或更小

### Q5: 如何切换回其他服务？
**A:** 
修改 `.env` 文件中的 `VIDEO_SERVICE`：
```bash
# 切换到Kling
VIDEO_SERVICE=kling

# 切换到Runway
VIDEO_SERVICE=runway
```
然后重启服务器。

---

## 📊 服务对比

| 特性 | Sora 2 | Kling AI | Runway Gen-3 |
|------|--------|----------|--------------|
| 画质 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 故事性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 速度 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 价格 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| API稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎓 高级用法

### 自定义提示词

如果你想更精细地控制视频效果，可以修改 `server.js` 中的提示词生成逻辑：

```javascript
// 在 server.js 中找到 generateVideoPrompt 函数
function generateVideoPrompt(photos, style, config) {
    // 添加你自己的提示词逻辑
    return {
        base: '你的自定义提示词',
        transition: '你想要的转场效果',
        mood: '你想要的情绪'
    };
}
```

### 使用Pro模型

修改 `server.js` 第105行：
```javascript
formData.append('model', 'sora-2-pro'); // 使用Pro版本（更慢但质量更好）
// 或
formData.append('model', 'sora-2'); // 使用标准版本（更快）
```

### 调整视频参数

在 `server.js` 第106-107行：
```javascript
formData.append('size', '1920x1080'); // 更改分辨率
formData.append('seconds', '10'); // 更改时长（最长10秒）
```

---

## 📞 技术支持

遇到问题？

1. **查看控制台日志**
   ```bash
   # 在终端查看详细日志
   npm start
   ```

2. **查看API_MODELS_COMPARISON.md**
   - 包含所有服务的详细对比

3. **OpenAI官方文档**
   - https://platform.openai.com/docs/guides/video-generation

---

## 🎉 开始使用

现在你已经准备好了！

1. ✅ 已集成Sora 2 API
2. ✅ 已安装必要依赖
3. ✅ 配置好API密钥
4. ✅ 重启服务器

**立即体验：**
```bash
# 重启服务器
npm start

# 打开浏览器
# http://localhost:3000
```

**享受用最先进的AI技术创作你的旅行故事视频！🚀📸🎬**
