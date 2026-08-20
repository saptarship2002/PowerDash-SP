import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow loading the dev server from other devices on the LAN (phone/tablet testing)
  allowedDevOrigins: ['192.168.1.17'],
  // static HTML export so the built `out/` folder can be drag-and-dropped straight onto Netlify
  // (Netlify's drag-and-drop has no build step — it can only ever serve pre-built static files).
  output: 'export',
};

export default nextConfig;
