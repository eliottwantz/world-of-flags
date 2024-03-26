# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=build /app/build build
RUN cd build && bun install
WORKDIR /app/build

# run the app
USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "index.js" ]
