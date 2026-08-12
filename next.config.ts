import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow loading the dev server from other devices on the LAN (phone/tablet testing)
  allowedDevOrigins: ['192.168.1.17'],
};

export default nextConfig;
