# 腾讯云部署指南

## ✅ 已完成的端口配置

所有配置文件已更新为使用 **80端口**，以满足腾讯云容器部署要求。

### 修改的文件

1. **Dockerfile**
   ```dockerfile
   ENV PORT=80
   ENV HOST=0.0.0.0
   EXPOSE 80
   ```

2. **cloudbaserc.json**
   ```json
   {
     "port": 80
   }
   ```

3. **server.js**
   - 自动读取环境变量 `PORT`（默认3000，容器内为80）

## 🚀 部署步骤

### 方式一：使用腾讯云CloudBase CLI

1. **安装CloudBase CLI**
   ```bash
   npm install -g @cloudbase/cli
   ```

2. **登录腾讯云**
   ```bash
   cloudbase login
   ```

3. **初始化环境**
   ```bash
   cloudbase init
   ```

4. **部署应用**
   ```bash
   cloudbase framework deploy
   ```

### 方式二：使用Docker镜像部署

1. **构建Docker镜像**
   ```bash
   docker build -t travel-photo-organizer:latest .
   ```

2. **测试镜像（本地80端口）**
   ```bash
   docker run -p 80:80 \
     -e OPENAI_API_KEY=your_key \
     -e OPENAI_API_BASE=your_base \
     travel-photo-organizer:latest
   ```

3. **推送到腾讯云容器镜像服务**
   ```bash
   # 登录腾讯云容器镜像仓库
   docker login ccr.ccs.tencentyun.com --username=your_username
   
   # 打标签
   docker tag travel-photo-organizer:latest \
     ccr.ccs.tencentyun.com/your_namespace/travel-photo-organizer:latest
   
   # 推送
   docker push ccr.ccs.tencentyun.com/your_namespace/travel-photo-organizer:latest
   ```

### 方式三：使用腾讯云容器服务TKE

1. 在腾讯云控制台创建TKE集群
2. 上传Docker镜像到容器镜像服务
3. 创建工作负载，选择上传的镜像
4. 配置服务，端口映射 80 -> 80
5. 配置环境变量（API密钥等）

## 🔧 环境变量配置

部署时需要配置以下环境变量：

```bash
# OpenAI API配置（必需）
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE=https://oa.api2d.net  # 或其他API端点

# 可选：视频生成服务配置
VIDEO_SERVICE=kling
KLING_API_KEY=your_kling_api_key

# 容器端口（已在Dockerfile中设置）
PORT=80
HOST=0.0.0.0
```

## 📝 健康检查配置

腾讯云容器服务需要配置健康检查：

- **Liveness Probe**（存活探测）
  - 协议：HTTP
  - 端口：80
  - 路径：`/health`
  - 初始延迟：10秒
  - 检查间隔：10秒

- **Readiness Probe**（就绪探测）
  - 协议：HTTP
  - 端口：80
  - 路径：`/api/health`
  - 初始延迟：5秒
  - 检查间隔：5秒

## 🐛 问题排查

### 连接被拒绝错误

如果看到 `connection refused` 错误：

1. **检查端口配置**
   - 确认 Dockerfile 中 `EXPOSE 80`
   - 确认环境变量 `PORT=80`
   - 确认 cloudbaserc.json 中 `"port": 80`

2. **检查应用启动**
   - 查看容器日志：`docker logs <container_id>`
   - 确认看到：`🚀 服务器运行在 http://0.0.0.0:80`

3. **检查健康检查端点**
   ```bash
   curl http://localhost:80/health
   curl http://localhost:80/api/health
   ```

### 环境变量未生效

在腾讯云控制台：
1. 容器服务 -> 工作负载 -> 编辑YAML
2. 找到 `env` 部分，添加环境变量：
   ```yaml
   env:
     - name: PORT
       value: "80"
     - name: OPENAI_API_KEY
       value: "your_key"
   ```

## 📦 完整部署命令（推荐）

```bash
# 1. 确保所有文件已保存
git add .
git commit -m "Update port to 80 for Tencent Cloud"

# 2. 构建并测试Docker镜像
docker build -t travel-photo-organizer .
docker run -d -p 8080:80 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e OPENAI_API_BASE=$OPENAI_API_BASE \
  --name travel-test \
  travel-photo-organizer

# 3. 测试健康检查
curl http://localhost:8080/health

# 4. 停止测试容器
docker stop travel-test && docker rm travel-test

# 5. 推送到腾讯云
# （根据上面的"方式二"步骤操作）
```

## ✨ 部署后验证

访问你的应用URL，应该能看到：
- ✅ 首页正常加载
- ✅ 可以上传照片
- ✅ 滑动整理功能正常
- ✅ AI故事生成功能正常

## 📞 需要帮助？

如果遇到问题：
1. 检查容器日志
2. 确认环境变量已设置
3. 验证健康检查端点
4. 查看腾讯云事件日志

---

**注意**：本地开发时仍然使用 `PORT=3000`（默认），只有在容器环境中才会使用 `PORT=80`。
