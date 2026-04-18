# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine
WORKDIR /app

COPY ./server .
# copy production dependencies and source code into final image
RUN bun install && bun run create-model

# run the app
EXPOSE 3000/tcp
CMD ["bun", "run", "start"]