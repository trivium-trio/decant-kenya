"use client";

import * as React from "react";
import { submitContactAction, type ContactActionResult } from "@/app/contact/actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<ContactActionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await submitContactAction({
        name,
        email,
        phone: phone.trim() ? phone.trim() : undefined,
        subject,
        message,
      });
      setResult(res);
    } catch {
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setResult(null);
  };

  if (result?.success) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 md:p-8" role="status">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground">Message Delivered</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {result && !result.success && !result.fieldErrors && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          <p>{result.message}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground">
          Full Name <span className="text-primary">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(result?.fieldErrors?.name)}
          aria-describedby={result?.fieldErrors?.name ? "contact-name-error" : undefined}
          placeholder="e.g. Jane Wanjiku"
          className="mt-1.5 flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {result?.fieldErrors?.name && (
          <p id="contact-name-error" className="mt-1.5 text-xs text-destructive">
            {result.fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
          Email Address <span className="text-primary">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(result?.fieldErrors?.email)}
          aria-describedby={result?.fieldErrors?.email ? "contact-email-error" : undefined}
          placeholder="e.g. jane@example.com"
          className="mt-1.5 flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {result?.fieldErrors?.email && (
          <p id="contact-email-error" className="mt-1.5 text-xs text-destructive">
            {result.fieldErrors.email}
          </p>
        )}
      </div>

      {/* Phone (optional, Kenyan format) */}
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground">
          Phone Number <span className="text-xs text-muted-foreground">(Optional, for WhatsApp updates)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={Boolean(result?.fieldErrors?.phone)}
          aria-describedby={result?.fieldErrors?.phone ? "contact-phone-error" : undefined}
          placeholder="e.g. 0712 345 678 or +254 712 345 678"
          className="mt-1.5 flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {result?.fieldErrors?.phone && (
          <p id="contact-phone-error" className="mt-1.5 text-xs text-destructive">
            {result.fieldErrors.phone}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground">
          Subject <span className="text-primary">*</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-invalid={Boolean(result?.fieldErrors?.subject)}
          aria-describedby={result?.fieldErrors?.subject ? "contact-subject-error" : undefined}
          placeholder="e.g. Inquiry about Baccarat Rouge 540 decant"
          className="mt-1.5 flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {result?.fieldErrors?.subject && (
          <p id="contact-subject-error" className="mt-1.5 text-xs text-destructive">
            {result.fieldErrors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
          Message <span className="text-primary">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(result?.fieldErrors?.message)}
          aria-describedby={result?.fieldErrors?.message ? "contact-message-error" : undefined}
          placeholder="Tell us what you need help with (min 10 characters)..."
          className="mt-1.5 flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          {result?.fieldErrors?.message ? (
            <p id="contact-message-error" className="text-destructive">
              {result.fieldErrors.message}
            </p>
          ) : (
            <span className="text-muted-foreground">Min 10, max 1000 characters</span>
          )}
          <span className="text-muted-foreground">{message.length}/1000</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending message...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
