import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "yominotsugai.com" },
      { protocol: "https", hostname: "www.ten-sura.com" },
      { protocol: "https", hostname: "tongari-anime.com" },
      { protocol: "https", hostname: "akane-banashi.com" },
      { protocol: "https", hostname: "kamiina-botan.com" },
      { protocol: "https", hostname: "otonarino-tenshisama.jp" },
      { protocol: "https", hostname: "4seasons-anime.com" },
      { protocol: "https", hostname: "korinojoheki-pr.com" },
      { protocol: "http", hostname: "re-zero-anime.jp" },
      { protocol: "http", hostname: "you-zitsu.com" },
      { protocol: "https", hostname: "*.co.jp" },
      { protocol: "https", hostname: "*.jp" },
      { protocol: "http", hostname: "*.jp" },
    ],
  },
};

export default nextConfig;
