FROM node:20-alpine AS base

### Dependencies ###
FROM base AS deps
RUN apk add --no-cache libc6-compat git python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install

# Builder
FROM base AS builder

RUN corepack enable
RUN corepack prepare npm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


### Production image runner ###
FROM base AS runner

# Set NODE_ENV to production
ENV NODE_ENV production

# Disable Next.js telemetry
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Set correct permissions for nextjs user and don't run as root
RUN addgroup nodejs
RUN adduser -SDH nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 2111
ENV PORT 2111
ENV HOSTNAME "0.0.0.0"

# Run the nextjs app
CMD ["node", "server.js"]

# docker build -t brainwave . && docker rm -f brainwave && docker run -d --name brainwave -p 2111:2111 brainwave