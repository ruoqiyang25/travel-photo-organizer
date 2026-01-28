# 🇨🇳 国内视频生成API接入指南

本指南专为国内用户设计，帮助你快速接入国内主流的图生视频AI服务，生成带文字的精美旅游回忆视频。

## 📋 目录

- [服务对比](#服务对比)
- [快手可灵 Kling AI](#快手可灵-kling-ai)
- [字节跳动即梦AI](#字节跳动即梦ai)
- [阿里云通义千问](#阿里云通义千问)
- [配置说明](#配置说明)
- [使用示例](#使用示例)
- [常见问题](#常见问题)

---

## 🎯 服务对比

| 服务 | 画质 | 速度 | 价格 | 文字支持 | 推荐度 |
|------|------|------|------|----------|--------|
| 快手可灵 | ⭐⭐⭐⭐⭐ | 快 | ¥0.5-2/次 | ✅ 优秀 | ⭐⭐⭐⭐⭐ |
| 即梦AI | ⭐⭐⭐⭐⭐ | 中等 | ¥1-3/次 | ✅ 优秀 | ⭐⭐⭐⭐⭐ |
| 通义千问 | ⭐⭐⭐⭐ | 快 | ¥0.3-1/次 | ✅ 良好 | ⭐⭐⭐⭐ |

---

## 🚀 快手可灵 Kling AI

### 简介
快手可灵是国内领先的AI视频生成服务，特别适合旅游视频场景。

### 特点
- ✨ 高质量视频输出（最高1080p）
- 🎬 支持文字叠加和字幕
- ⚡ 生成速度快（约30-60秒）
- 🎨 多种风格模板
- 💰 价格实惠

### 获取API密钥

1. **注册账号**
   - 访问：https://klingai.kuaishou.com/
   - 使用手机号注册
   - 完成实名认证

2. **创建API密钥**
   - 进入控制台：https://console.klingai.com/
   - 点击「API密钥」
   - 创建新密钥并保存

3. **充值**
   - 最低充值：¥10
   - 新用户赠送免费额度

### API文档
- 官方文档：https://docs.klingai.com/
- 图生视频API：https://docs.klingai.com/docs/image2video

### 配置示例

```env
VIDEO_SERVICE=kling
KLING_API_KEY=sk-kling_your_api_key_here
```

### 代码示例

```javascript
// 调用Kling生成带文字的旅游视频
const response = await generateVideoWithKling(
    imageBase64,
    "旅游风景视频，平滑运镜，色彩鲜艳",
    {
        addCaptions: true,
        style: 'vlog'
    },
    "Day 1 打卡第一站 ✨"
);
```

---

## 🎨 字节跳动即梦AI

### 简介
字节跳动旗下的专业视频生成服务，提供电影级画质。

### 特点
- 🎥 电影级画质
- 📝 智能字幕生成
- 🌏 针对旅游场景优化
- 🎭 多种艺术风格
- 🔊 可添加音乐和配音

### 获取API密钥

1. **注册火山引擎账号**
   - 访问：https://www.volcengine.com/
   - 注册并完成企业认证（个人也可用）

2. **开通即梦AI服务**
   - 进入控制台
   - 搜索「即梦」或「视频生成」
   - 开通服务

3. **获取API密钥**
   - API密钥管理：https://console.volcengine.com/iam/keymanage/
   - 创建AccessKey

4. **充值**
   - 首次充值建议：¥50
   - 包月套餐更优惠

### API文档
- 产品文档：https://www.volcengine.com/docs/6791/1142328
- API参考：https://www.volcengine.com/docs/6791/1142329

### 配置示例

```env
VIDEO_SERVICE=jimeng
JIMENG_API_KEY=your_jimeng_access_key_here
```

### 高级功能

```javascript
// 生成带智能字幕的旅游视频
const response = await generateVideoWithJimeng(
    imageBase64,
    "电影感旅游视频，缓慢推进镜头，金色日落",
    {
        addCaptions: true,
        style: 'cinematic'
    },
    "那些美好时光 · 1/10"
);
```

---

## ☁️ 阿里云通义千问

### 简介
阿里云推出的企业级视频生成服务，稳定可靠。

### 特点
- 🏢 企业级稳定性
- 🇨🇳 中文理解优秀
- 💼 技术支持完善
- 📊 详细的使用统计
- 💰 按量计费灵活

### 获取API密钥

1. **注册阿里云账号**
   - 访问：https://www.aliyun.com/
   - 完成实名认证

2. **开通DashScope服务**
   - 访问：https://dashscope.aliyun.com/
   - 开通「通义千问」视频生成服务

3. **获取API-KEY**
   - 控制台：https://dashscope.console.aliyun.com/apiKey
   - 创建并保存API-KEY

4. **充值**
   - 按量计费，用多少付多少
   - 新用户有免费额度

### API文档
- 快速开始：https://help.aliyun.com/zh/dashscope/
- 视频生成API：https://help.aliyun.com/zh/dashscope/developer-reference/video-generation

### 配置示例

```env
VIDEO_SERVICE=qwen
QWEN_API_KEY=sk-your_qwen_api_key_here
```

---

## ⚙️ 配置说明

### 1. 复制配置文件

```bash
cp .env.example .env
```

### 2. 选择服务并配置

编辑 `.env` 文件：

```env
# 选择要使用的服务（推荐kling）
VIDEO_SERVICE=kling

# 填入对应的API密钥
KLING_API_KEY=your_actual_api_key_here
```

### 3. 测试配置

```bash
# 启动服务器
npm start

# 访问健康检查接口
curl http://localhost:3000/api/health
```

响应示例：
```json
{
  "status": "ok",
  "service": "kling",
  "configured": true,
  "timestamp": "2026-01-29T00:00:00.000Z"
}
```

---

## 💡 使用示例

### 基础使用

1. 打开应用：http://localhost:3000
2. 上传旅游照片
3. 选择视频风格：
   - 电影感（Cinematic）
   - Vlog风格
   - 回忆录（Memories）
   - 动感快节奏（Dynamic）
4. 配置选项：
   - ✅ 添加AI配音解说
   - ✅ 添加文字字幕
5. 点击「生成旅行视频」

### 生成的视频特点

✨ **自动添加文字**
- 每张照片都会生成智能文字描述
- 文字样式根据风格自动调整
- 支持中文和Emoji

📝 **文字示例**
- Vlog风格：`Day 1 打卡第一站 ✨`
- 电影感：`旅行回忆 - 第1章`
- 回忆录：`时光胶囊 1/10`
- 动感：`冒险第1站 🚀`

🎬 **视频效果**
- 5秒/张照片
- 流畅的转场效果
- 配合音乐节奏
- 专业级调色

---

## ❓ 常见问题

### Q1: 哪个服务最适合我？

**推荐选择：**
- 预算有限：通义千问（¥0.3-1/次）
- 追求质量：快手可灵或即梦AI
- 企业使用：通义千问（阿里云支持完善）

### Q2: 生成速度有多快？

- 快手可灵：30-60秒/张
- 即梦AI：60-90秒/张
- 通义千问：30-50秒/张

### Q3: 如何控制成本？

1. **选择合适的质量等级**
   - 预览用标准质量
   - 最终版用高质量

2. **批量生成优惠**
   - 一次生成多张照片
   - 使用包月套餐

3. **测试阶段控制**
   - 先用少量照片测试
   - 满意后再生成完整版

### Q4: 文字叠加效果如何定制？

在 `server.js` 中修改文字样式：

```javascript
text_overlay: {
    text: caption,
    position: 'bottom',      // 位置: top, center, bottom
    font_size: 24,           // 字体大小
    font_color: '#FFFFFF',   // 字体颜色
    background: 'rgba(0,0,0,0.6)',  // 背景色
    animation: 'fade_in'     // 动画: fade_in, slide_up
}
```

### Q5: 遇到错误怎么办？

**常见错误及解决：**

1. **API密钥无效**
   ```
   错误：401 Unauthorized
   解决：检查API密钥是否正确复制，是否过期
   ```

2. **余额不足**
   ```
   错误：402 Payment Required
   解决：充值账户余额
   ```

3. **请求超时**
   ```
   错误：ETIMEDOUT
   解决：检查网络连接，稍后重试
   ```

4. **图片格式错误**
   ```
   错误：400 Bad Request - Invalid image format
   解决：确保上传JPG/PNG格式，大小<10MB
   ```

### Q6: 可以同时使用多个服务吗？

可以！在代码中切换 `VIDEO_SERVICE` 环境变量即可：

```bash
# 使用快手可灵
VIDEO_SERVICE=kling npm start

# 使用即梦AI
VIDEO_SERVICE=jimeng npm start
```

---

## 📞 技术支持

### 官方支持

- 快手可灵：https://klingai.kuaishou.com/support
- 即梦AI：https://www.volcengine.com/docs/6791/1142328
- 通义千问：https://help.aliyun.com/zh/dashscope/

### 社区交流

- GitHub Issues：https://github.com/ruoqiyang25/travel-photo-organizer/issues
- 加入讨论组获取帮助

---

## 🎉 开始使用

准备好了吗？让我们开始创建你的旅游回忆视频吧！

```bash
# 1. 安装依赖
npm install

# 2. 配置API密钥
cp .env.example .env
# 编辑 .env 填入你的API密钥

# 3. 启动服务器
npm start

# 4. 打开浏览器
open http://localhost:3000
```

祝你使用愉快！✨🎬📸
