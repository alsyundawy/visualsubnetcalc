FROM node:20-alpine AS build

ARG REACT_APP_SERVICES_HOST=/services/m

# Set working directory and copy only package files for better cache utilization
WORKDIR /app/src
COPY src/package*.json /app/src/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build the application
RUN npm run build

# Use a specific version of nginx
# https://hub.docker.com/r/nginxinc/nginx-unprivileged
FROM nginxinc/nginx-unprivileged:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Health check for unprivileged nginx (default port 8080)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["sh", "-c", "wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1"]

# Set a non-root user (UID 101 is the standard 'nginx' user in nginxinc/nginx-unprivileged)
USER 101
