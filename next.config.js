const path = require('path');

const envToUse = 'LOCAL';
const devUrl = 'https://icp-dashboard.saal.ai';
// Family Tree backend (Kubernetes service, no VIP).
// Only proxy when FAMILY_TREE_API_URL is explicitly set; otherwise Next.js mock API routes handle requests.
const familyTreeUrl = process.env.FAMILY_TREE_API_URL;

const buildEnvUrls = () => {
  if (familyTreeUrl) {
    // Proxy family-tree API to real Kubernetes backend
    return {
      '/api/auth/': `/api/auth`,
      '/api/v1/family-tree/': familyTreeUrl,
      '/api/v1/persons/': familyTreeUrl,
      '/static/img/': familyTreeUrl,
      '/': devUrl,
    };
  }
  // No real backend set → pass-through local mock routes, proxy everything else to BI backend
  return {
    '/api/auth/': `/api/auth`,
    '/api/v1/': `/api/v1`,   // keep mock API routes local
    '/': devUrl,
  };
};

const envs = {
  LOCAL: buildEnvUrls(),
};

const envUrls = envs[envToUse];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.BASE_URL,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  serverRuntimeConfig: {
    KEYCLOAK_URL: process.env.KEYCLOAK_URL,
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_SECRET: process.env.KEYCLOAK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    BASE_URL: process.env.BASE_URL,
    INTL_FILES_PATH: process.env.INTL_FILES_PATH
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    KEYCLOAK_ENABLED: process.env.KEYCLOAK_ENABLED,
    CACHE_ENABLED: process.env.CACHE_ENABLED,
    BASE_URL: process.env.BASE_URL,
    FAVICON: process.env.FAVICON,
    APP_LOGO: process.env.APP_LOGO,
    APP_LOGO_DARK: process.env.APP_LOGO_DARK,
    APPLICATION_NAME_ENGLISH: process.env.APPLICATION_NAME_ENGLISH,
    APPLICATION_NAME_ARABIC: process.env.APPLICATION_NAME_ARABIC,
    SHOW_EMIRATES_RISKS_DASHBOARD: process.env.SHOW_EMIRATES_RISKS_DASHBOARD,
    FAMILY_TREE_API_URL: process.env.FAMILY_TREE_API_URL || '',
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const urls = Object.entries(envUrls)?.map(([keyName, url]) => ({
        source: `${keyName}:path*`,
        destination: `${url}/:path*`,
      }))
      return urls;
    }
    return [];
  },
  async redirects() {
    if (process.env.BASE_URL) {
      return [
        {
          source: '/api/auth/callback/keycloak',
          destination: `${process.env.BASE_URL}/api/auth/callback/keycloak`,
          permanent: true,
          basePath: false,
        },
        {
          source: '/',
          destination: process.env.BASE_URL,
          permanent: true,
          basePath: false,
        }
      ]
    }

    return []
  }
}

module.exports = nextConfig
