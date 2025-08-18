FROM node:20-alpine AS base
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY ../../apps/api/package.json ./package.json
RUN pnpm install --frozen-lockfile || pnpm install
COPY ../../tsconfig.base.json ./
COPY . .
RUN pnpm generate || true && pnpm build || true

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
EXPOSE 8080
CMD ["node","dist/index.js"]
FROM node:20-alpine AS base
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY ../../apps/api/package.json ./package.json
RUN pnpm install --frozen-lockfile || pnpm install
COPY ../../tsconfig.base.json ./
COPY . .
RUN pnpm generate || true && pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
EXPOSE 8080
CMD ["node","dist/index.js"]
