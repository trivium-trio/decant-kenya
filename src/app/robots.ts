import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/order/", "/account"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
