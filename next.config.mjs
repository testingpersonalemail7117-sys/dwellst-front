const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your original Tailwind setup, restored as it was.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Forward /api/* to the Express backend so the browser only talks to this origin.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;