# Base image with Puppeteer dependencies
FROM ghcr.io/puppeteer/puppeteer:23 AS builder

# Set permissions and working directory
USER root
WORKDIR /app
RUN mkdir -p /app/.next/cache && chown -R pptruser:pptruser /app

# Switch back to Puppeteer user
USER pptruser

# Copy package files and install dependencies
COPY --chown=pptruser:pptruser package.json /app/
COPY --chown=pptruser:pptruser .npmrc /app/
RUN yarn install --frozen-lockfile

# Copy application code and build
COPY --chown=pptruser:pptruser . /app/
RUN yarn run build

# Use a minimal final image based on Alpine
FROM node:22-alpine

# Install required system dependencies and fonts
RUN apk add --no-cache \
    ca-certificates \
    chromium \
    freetype \
    harfbuzz \
    libjpeg-turbo \
    libx11 \
    libxi \
    libxrandr \
    libxrender \
    mesa-gl \
    nss \
    ttf-freefont \
    ttf-dejavu \
    udev \
    && mkdir -p /etc/chromium.d

# Set the working directory
WORKDIR /app

# Copy the application and public assets (including fonts) from the builder stage
COPY --from=builder /app /app

# Puppeteer dependencies
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]