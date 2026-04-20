# 使用最新 Alpine 作为基础镜像
FROM oven/bun:canary-slim

WORKDIR /app

COPY . .
RUN bun install

EXPOSE 3366

CMD ["bun", "start"]