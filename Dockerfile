FROM oven/bun:0.6.7

RUN mkdir -p /usr/server

WORKDIR /usr/server

COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install

COPY . .

EXPOSE 3000

ENTRYPOINT ["bun", "index.ts"]