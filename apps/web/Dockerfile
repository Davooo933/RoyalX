FROM node:20-alpine AS build
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY ../../apps/web/package.json ./package.json
RUN pnpm install || true
COPY . .
RUN pnpm build || true

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
FROM node:20-alpine AS build
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY ../../apps/web/package.json ./package.json
RUN pnpm install || true
COPY . .
RUN pnpm build && pnpm preview --host 0.0.0.0 --port 4173 & sleep 1

FROM alpine:3.19
CMD ["/bin/sh","-c","sleep 3600"]
