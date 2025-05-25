# Build stage
FROM rust:1.87-slim AS wasm-builder

# Set working directory
WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y curl build-essential pkg-config libssl-dev

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Copy Rust source files
COPY src/wasm /app/src/wasm

# Build WebAssembly
WORKDIR /app/src/wasm
RUN wasm-pack build --target web

# Node build stage
FROM node:24-alpine AS build
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy the rest of the application
COPY . .
# Copy WebAssembly build from previous stage
COPY --from=wasm-builder /app/src/wasm/pkg /app/src/wasm/pkg
# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create a user with UID 1000
RUN adduser -u 1000 -D myuser

<<<<<<< Updated upstream
# Copy build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

# Change ownership of /usr/share/nginx/html to myuser
RUN chown -R myuser:myuser /usr/share/nginx/html
=======
# Remove the user directive from the Nginx configuration file
RUN sed -i '/^user  nginx;/d' /etc/nginx/nginx.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

# Set permissions for nginx directories and files
RUN chown -R myuser:myuser /usr/share/nginx/html && \
    chown -R myuser:myuser /var/cache/nginx && \
    chown -R myuser:myuser /etc/nginx/conf.d && \
    chown -R myuser:myuser /var/log/nginx

RUN mkdir -p /run && chown myuser:myuser /run
RUN touch /run/nginx.pid && chown myuser:myuser /run/nginx.pid
>>>>>>> Stashed changes

# Switch to myuser
USER myuser

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]