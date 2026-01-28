# 🇨🇳 腾讯云部署指南

## 方案选择

腾讯云有3种部署方式，按简单程度排序：

### 1. 云开发 CloudBase（最简单，推荐）⭐
- ✅ 最简单，几分钟搞定
- ✅ 自动扩容
- ✅ 有免费额度
- ✅ 适合快速上线

### 2. 轻量应用服务器（中等难度）
- ✅ 完全控制
- ✅ 配置灵活
- ✅ 价格便宜（¥50/月起）
- ⚠️ 需要手动配置

### 3. 云服务器 CVM（最灵活）
- ✅ 完全控制
- ✅ 性能最好
- ⚠️ 配置复杂
- ⚠️ 价格较高

---

## ⭐ 推荐：腾讯云 CloudBase 部署

### 步骤1：注册腾讯云账号

1. 访问：https://cloud.tencent.com/
2. 注册并完成实名认证
3. 获取新用户代金券（通常有优惠）

### 步骤2：开通云开发

1. 访问云开发控制台：
   https://console.cloud.tencent.com/tcb

2. 点击"新建环境"
   - 环境名称：`travel-photo-organizer`
   - 计费模式：按量付费（有免费额度）
   - 区域：选择离你最近的（如：上海）

3. 等待环境创建（约1分钟）

### 步骤3：安装CloudBase CLI

在终端执行：

```bash
npm install -g @cloudbase/cli
```

### 步骤4：登录CloudBase

```bash
tcb login
```

会打开浏览器进行授权登录

### 步骤5：初始化项目

```bash
# 在项目目录下执行
tcb init --without-template
```

选择：
- 选择你刚创建的环境
- 项目名称：travel-photo-organizer

### 步骤6：创建cloudbaserc.json配置文件

项目根目录会自动生成 `cloudbaserc.json`，编辑它：

```json
{
  "envId": "你的环境ID",
  "version": "2.0",
  "$schema": "https://framework-1258016615.tcloudbaseapp.com/schema/latest.json",
  "framework": {
    "name": "travel-photo-organizer",
    "plugins": {
      "node": {
        "use": "@cloudbase/framework-plugin-node",
        "inputs": {
          "entry": "server.js",
          "path": "/",
          "name": "travel-app",
          "buildCommand": "npm install",
          "installCommand": "npm install"
        }
      }
    }
  }
}
```

### 步骤7：配置环境变量

在腾讯云控制台：
1. 进入你的环境
2. 云函数 → 环境变量
3. 添加：
   - `VIDEO_SERVICE` = `sora`
   - `OPENAI_API_KEY` = `你的OpenAI密钥`
   - `PORT` = `3000`

### 步骤8：部署

```bash
tcb framework deploy
```

等待部署完成（约2-3分钟）

### 步骤9：获取访问地址

部署成功后，会显示访问地址，类似：
```
https://你的环境ID.service.tcloudbase.com/
```

**完成！国内可以直接访问！** 🎉

---

## 💰 费用说明

### 云开发免费额度（每月）
- 云函数：4万次调用
- 云存储：5GB
- CDN流量：1GB
- 数据库：2GB

**小规模使用完全免费！**

如果超出免费额度：
- 云函数：¥0.00011108/GBs
- 存储：¥0.043/GB/月
- 流量：¥0.15/GB

**预计成本**：小规模使用 ¥0-20/月

---

## 🔧 故障排查

### 问题1：部署失败

**解决：**
```bash
# 查看日志
tcb fn log list
tcb fn log query --function-name travel-app
```

### 问题2：环境变量未生效

**解决：**
在控制台手动添加后，重新部署：
```bash
tcb framework deploy --force
```

### 问题3：访问超时

**解决：**
增加云函数超时时间：
1. 控制台 → 云函数 → 函数配置
2. 执行超时时间改为 60秒

---

## 📱 自定义域名

### 绑定自己的域名

1. 在腾讯云购买域名（可选）
2. 进入云开发 → HTTP访问服务
3. 添加自定义域名
4. 配置DNS解析（按照提示操作）
5. 等待SSL证书自动配置

**完成后可以用自己的域名访问！**

---

## 🔄 自动部署

### 配置GitHub自动部署

1. 在GitHub仓库设置webhook
2. 配置腾讯云触发器
3. 每次git push自动部署

**详细步骤：**
https://docs.cloudbase.net/ci/overview.html

---

## 📞 需要帮助？

- 腾讯云文档：https://docs.cloudbase.net/
- 技术支持：https://cloud.tencent.com/document/product/876
- 控制台：https://console.cloud.tencent.com/tcb

---

**准备好了吗？按照步骤一步步来！** 🚀
