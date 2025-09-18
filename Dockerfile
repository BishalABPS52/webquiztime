# Build Next.js frontend for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Production image, copy built files and run next start
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Set the correct permissions
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose and run the application
EXPOSE 3000
CMD ["npm", "start"]