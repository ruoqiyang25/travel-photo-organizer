# 使用官方Node.js 18镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制所有项目文件
COPY . .

# 设置环境变量 - 容器内使用80端口
ENV PORT=80
ENV HOST=0.0.0.0

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["npm", "start"]
