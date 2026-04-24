# 使用最新 Alpine 作为基础镜像
FROM oven/bun:canary-alpine AS build 

WORKDIR /app
COPY . .

RUN bun install && bun run create-model

FROM oven/bun:canary-alpine 

WORKDIR /app

COPY . .
COPY --from=build /app/prisma/generated ./prisma/generated
RUN bun install --production --frozen-lockfile --linker=isolated

EXPOSE 3366

CMD ["bun", "start"]