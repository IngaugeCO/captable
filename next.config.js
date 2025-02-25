import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_OUTPUT ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        hostname: "randomuser.me",
        protocol: "https",
      },
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    /**
     * Critical: prevents " ⨯ ./node_modules/canvas/build/Release/canvas.node
     * Module parse failed: Unexpected character '' (1:0)" error
     */
    config.resolve.alias.canvas = false;

    // Ensure path aliases are properly resolved
    const srcPath = join(__dirname, "src");
    const prismaPath = join(__dirname, "prisma");
    
    // Add path aliases
    Object.assign(config.resolve.alias, {
      "@": srcPath,
      "@/prisma": prismaPath,
      "@/env": join(srcPath, "env.js"),
      "@/server": join(srcPath, "server"),
      "@/lib": join(srcPath, "lib"),
      "@/components": join(srcPath, "components"),
      "@/common": join(srcPath, "common"),
      "@/constants": join(srcPath, "constants"),
      "@/trpc": join(srcPath, "trpc"),
      "@/emails": join(srcPath, "emails"),
      "@/jobs": join(srcPath, "jobs"),
      "@/app": join(srcPath, "app"),
      "@/providers": join(srcPath, "providers"),
      "@/styles": join(srcPath, "styles"),
      "@/assets": join(srcPath, "assets"),
    });

    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }

    return config;
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "pino",
      "pino-pretty",
      "pdf-lib",
      "@aws-sdk/s3-request-presigner",
      "@react-pdf/renderer",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const hasSentry = !!(
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
);

export default hasSentry
  ? withSentryConfig(bundleAnalyzer(nextConfig), {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : bundleAnalyzer(nextConfig);
