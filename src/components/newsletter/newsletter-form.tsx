"use client";

import * as React from "react";
import Link from "next/link";
import { subscribeNewsletterAction } from "@/app/actions/newsletter";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await subscribeNewsletterAction(email);
      setResult(res);
      if (res.success) {
        setEmail("");
      }
    } catch {
      setResult({
        success: false,
        message: "Unable to subscribe at this moment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
        Stay in the Know
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get first access to new decant arrivals, limited discovery drops, and fragrance notes.
      </p>

      {result?.success ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary" role="status">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{result.message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Newsletter email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-invalid={result && !result.success ? "true" : "false"}
                aria-describedby={result && !result.success ? "newsletter-error" : undefined}
                className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {result && !result.success && (
            <p id="newsletter-error" className="mt-2 flex items-center gap-1.5 text-xs text-destructive" role="alert">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{result.message}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>We respect your privacy under the Kenya DPA.</span>
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center font-medium underline underline-offset-2 hover:text-foreground"
            >
              Privacy policy
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
