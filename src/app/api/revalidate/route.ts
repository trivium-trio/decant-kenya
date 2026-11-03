import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "node:crypto";

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  const configuredSecret = process.env.REVALIDATE_SECRET?.trim();
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured on the storefront." },
      { status: 500 }
    );
  }

  const incomingSecret =
    req.headers.get("x-revalidate-secret") ||
    req.headers.get("x-secret") ||
    "";

  if (!incomingSecret || !timingSafeEqual(incomingSecret, configuredSecret)) {
    return NextResponse.json(
      { error: "Invalid revalidation secret." },
      { status: 401 }
    );
  }

  let body: { tag?: string; tags?: string[]; timestamp?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON payload." }, { status: 400 });
  }

  if (typeof body.timestamp === "number") {
    const now = Date.now();
    const age = now - body.timestamp;
    // Allow up to 60s future skew, reject if older than 5 minutes (300,000ms)
    if (age < -60000 || age > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Revalidation timestamp expired or invalid clock skew." },
        { status: 400 }
      );
    }
  }

  const tagsToRevalidate: string[] = [];
  if (body.tag && typeof body.tag === "string") {
    tagsToRevalidate.push(body.tag);
  }
  if (Array.isArray(body.tags)) {
    for (const t of body.tags) {
      if (typeof t === "string" && !tagsToRevalidate.includes(t)) {
        tagsToRevalidate.push(t);
      }
    }
  }

  if (tagsToRevalidate.length === 0) {
    tagsToRevalidate.push("catalogue");
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    revalidated: true,
    tags: tagsToRevalidate,
    now: Date.now(),
  });
}
