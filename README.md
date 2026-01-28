# 旅行照片整理器 📸

一个像刷抖音一样轻松整理旅行照片的 Web 应用，支持滑动选择保留或删除照片，并通过 AI 自动生成流畅、有故事性的旅行视频。

## ✨ 功能特点

### 1. 社交化照片整理
- **向右滑动**：保留照片 ✅
- **向左滑动**：删除照片 ❌
- **点击按钮**：也可以使用底部按钮进行操作
- **撤销功能**：支持撤销上一步操作

### 2. 类抖音滑动体验
- 流畅的卡片滑动动画
- 实时的视觉反馈
- 堆叠卡片设计
- 支持触摸和鼠标操作

### 3. AI 智能视频生成 ✨
- **图生视频技术**：使用 Kling AI / 即梦 AI 等先进的图生视频模型
- **流畅转场**：AI 自动生成照片间的平滑过渡和动态效果
- **故事化叙事**：根据视频风格智能生成视觉故事
- **多种风格**：电影感、Vlog、回忆录、动感快节奏
- **背景音乐**：智能匹配音乐氛围
- **AI 配音**：自动生成旁白解说（可选）
- **字幕文字**：动态字幕效果（可选）

## 🚀 快速开始

### 前置要求

- Node.js 14+ 
- 任意 AI 视频生成服务的 API Key（Kling AI / 即梦 AI / Runway 等）

### 安装步骤

1. **克隆项目**
   ```bash
   cd /path/to/your/directory
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 API 密钥**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑 .env 文件，填入你的 API 密钥
   # 推荐使用 Kling AI：https://www.newapi.ai/
   ```

   在 `.env` 文件中配置：
   ```env
   VIDEO_SERVICE=kling
   KLING_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **启动服务器**
   ```bash
   npm start
   ```

5. **打开浏览器**
   访问 `http://localhost:3000`

### 📱 在手机上使用

1. 确保手机和电脑在同一局域网
2. 启动服务器后，查看本机IP地址
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
3. 在手机浏览器中访问：`http://your-ip:3000`
4. 享受原生 App 般的滑动体验

## 🎬 视频生成服务配置

本项目支持多个 AI 视频生成服务，你可以选择其中一个：

### 1. Kling AI（推荐）
- **获取地址**：https://www.newapi.ai/
- **特点**：图生视频效果好，响应速度快
- **配置**：
  ```env
  VIDEO_SERVICE=kling
  KLING_API_KEY=your_kling_api_key
  ```

### 2. 即梦 AI
- **获取地址**：https://www.volcengine.com/
- **特点**：国内服务，稳定性好
- **配置**：
  ```env
  VIDEO_SERVICE=jimeng
  JIMENG_API_KEY=your_jimeng_api_key
  ```

### 3. Runway
- **获取地址**：https://runwayml.com/
- **特点**：专业级视频生成
- **配置**：
  ```env
  VIDEO_SERVICE=runway
  RUNWAY_API_KEY=your_runway_api_key
  ```

## 📱 移动端优化

- 完全响应式设计，适配各种屏幕尺寸
- 触摸手势优化，丝滑流畅
- PWA 支持，可添加到主屏幕
- 离线可用（需要配置 Service Worker）

## 🎨 技术栈

- **纯原生开发**：无需任何框架或库
- **HTML5**：语义化标签
- **CSS3**：现代布局和动画
- **Vanilla JavaScript**：高性能交互
- **Canvas API**：视频预览生成

## 📂 项目结构

```
travel-photo-organizer/
├── index.html          # 主页面
├── style.css           # 样式文件
├── app.js             # 核心逻辑
└── README.md          # 说明文档
```

## 🎯 核心功能实现

### 滑动手势检测
- 支持鼠标拖拽和触摸滑动
- 动态阈值判断
- 平滑的回弹动画

### 卡片堆叠效果
- 最多显示 3 张卡片
- 层叠缩放效果
- 自动更新卡片队列

### 视频生成
- Canvas 实时渲染
- 渐变转场效果
- 进度实时反馈

## 🔮 未来优化方向

### 后端集成
- 连接云存储服务（如 AWS S3、阿里云 OSS）
- 集成开源视频编辑模型（如 FFmpeg.js）
- AI 配音服务（如 Azure TTS、讯飞语音）
- 智能字幕生成

### 功能增强
- 照片智能排序（按时间、地点）
- 更多转场效果
- 音乐库选择
- 滤镜和特效
- 批量导出照片

### 性能优化
- 图片压缩和优化
- 懒加载优化
- 缓存策略
- PWA 离线支持

## 💡 使用建议

1. **照片数量**：建议一次上传 10-50 张照片
2. **照片格式**：支持 JPG、PNG、WebP 等常见格式
3. **浏览器**：建议使用 Chrome、Safari、Edge 等现代浏览器
4. **网络**：首次加载后可离线使用

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**Enjoy organizing your travel photos! ✈️📸**
