FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked into the client bundle at build time: empty means "same origin",
# so browser requests go through this app's own /api and /media rewrites
# (see next.config.ts) instead of needing a separately-exposed backend host.
ENV NEXT_PUBLIC_API_BASE_URL=""
# Next.js resolves rewrite destinations into routes-manifest.json at build
# time, not at container runtime - so BACKEND_ORIGIN must be set here, not
# just in docker-compose.yml's runtime `environment:` block, or the rewrite
# proxy freezes in the default (http://localhost:8080) and can never reach
# the backend container.
ARG BACKEND_ORIGIN=http://backend:8080
ENV BACKEND_ORIGIN=$BACKEND_ORIGIN
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
