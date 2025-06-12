# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies and source files
RUN npm ci --only=production && rm -rf src tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S stellarush -u 1001

# Change ownership of the app directory
RUN chown -R stellarush:nodejs /app
USER stellarush

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "start"]
