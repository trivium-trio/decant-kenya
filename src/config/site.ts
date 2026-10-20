export const siteConfig = {
  name: "[Brand name]",
  description: "[One sentence: authentic 10ml decants, delivered to you]",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Shop", href: "/shop" },
    { label: "Discovery sets", href: "/sets" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
  ],
  footer: [
    { label: "Shipping and returns", href: "/shipping-returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;
