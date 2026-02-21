FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
