# =============================================================================
# ICP DASHBOARDS UI - BUILD & HOST
# =============================================================================
# Prerequisites: Base images must be built first using Dockerfile.base
# =============================================================================

ARG BUILDER_BASE_IMAGE=hc227hrv01.ica.ae/icp-app/icp-dashboards-builder-base:1.1
ARG RUNTIME_BASE_IMAGE=hc227hrv01.ica.ae/icp-app/icp-dashboards-runtime-base:1.1

# -----------------------------------------------------------------------------
# BUILD STAGE
# -----------------------------------------------------------------------------
FROM ${BUILDER_BASE_IMAGE} AS builder

WORKDIR /app

# Copy source code and build (node_modules already in base image)
COPY . /app/
RUN yarn run build

# -----------------------------------------------------------------------------
# HOST STAGE
# -----------------------------------------------------------------------------
FROM ${RUNTIME_BASE_IMAGE}

WORKDIR /app

# Copy built application
COPY --from=builder /app /app

# Host the application
EXPOSE 3000
CMD ["yarn", "start"]
