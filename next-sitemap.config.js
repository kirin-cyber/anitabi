/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://anitabi.site",
  generateRobotsTxt: true,
  exclude: ["/api/*", "/anime/search"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/api/" },
    ],
  },
  changefreq: "daily",
  priority: 0.7,
  additionalPaths: async () => [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/anime", priority: 0.9, changefreq: "daily" },
    { loc: "/ranking", priority: 0.8, changefreq: "daily" },
    { loc: "/schedule", priority: 0.8, changefreq: "daily" },
    { loc: "/diagnosis", priority: 0.8, changefreq: "weekly" },
    { loc: "/voice-actors", priority: 0.7, changefreq: "weekly" },
    { loc: "/news", priority: 0.8, changefreq: "daily" },
    { loc: "/watchlist", priority: 0.5, changefreq: "monthly" },
  ],
};
