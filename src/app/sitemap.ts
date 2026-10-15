import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getShopApi } from "@/lib/data/api";

const staticRoutes = ["", "/shop", "/sets", "/how-it-works", "/shipping-returns", "/faq", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const api = getShopApi();
  const [{ items }, sets] = await Promise.all([api.listProducts({ pageSize: 1000 }), api.listSets()]);
  return [
    ...staticRoutes.map((path) => ({ url: `${siteConfig.url}${path}` })),
    ...items.map((p) => ({ url: `${siteConfig.url}/product/${p.slug}` })),
    ...sets.map((s) => ({ url: `${siteConfig.url}/sets/${s.slug}` })),
  ];
}
