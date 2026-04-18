# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine
WORKDIR /app

COPY ./server .
# copy production dependencies and source code into final image
RUN BUN_IMPERSONATE_NODE_VERSION=20.19.0 bun install

# run the app
EXPOSE 3000/tcp
CMD ["bun", "run", "start"]