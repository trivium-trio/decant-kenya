"use server";

import { getShopApi } from "@/lib/data/api";
import type { ContactInput } from "@/lib/data/types";
import { validateKenyanPhone } from "@/lib/checkout/validation";

export type ContactActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };
};

export async function submitContactAction(input: ContactInput): Promise<ContactActionResult> {
  if (!input || typeof input !== "object") {
    return {
      success: false,
      message: "Invalid submission data.",
    };
  }

  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const subject = input.subject?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  const fieldErrors: NonNullable<ContactActionResult["fieldErrors"]> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Please enter your name (at least 2 characters).";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (phone) {
    const phoneVal = validateKenyanPhone(phone);
    if (!phoneVal.isValid) {
      fieldErrors.phone = phoneVal.error ?? "Enter a valid Kenyan phone number (e.g. 0712345678).";
    }
  }

  if (!subject || subject.length < 2) {
    fieldErrors.subject = "Please enter a subject (at least 2 characters).";
  }

  if (!message || message.length < 10) {
    fieldErrors.message = "Message must be at least 10 characters.";
  } else if (message.length > 1000) {
    fieldErrors.message = "Message cannot exceed 1000 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted errors.",
      fieldErrors,
    };
  }

  try {
    const normalizedPhone = phone ? (validateKenyanPhone(phone).normalized ?? phone) : undefined;
    const result = await getShopApi().submitContactForm({
      name,
      email,
      phone: normalizedPhone,
      subject,
      message,
    });

    return {
      success: result.success,
      message: result.message,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to send message. Please try again.",
    };
  }
}
