"use server";

import { getShopApi } from "@/lib/data/api";
import type { CheckoutInput, Order } from "@/lib/data/types";
import { validateEmail, validateKenyanPhone } from "@/lib/checkout/validation";

export async function createOrderAction(input: CheckoutInput): Promise<Order> {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid checkout payload.");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const { address } = input;
  if (!address || typeof address !== "object") {
    throw new Error("Delivery address is required.");
  }

  if (!address.fullName || address.fullName.trim().length < 2) {
    throw new Error("Full name must be at least 2 characters.");
  }

  const phoneVal = validateKenyanPhone(address.phone);
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.error ?? "Invalid phone number.");
  }

  if (!address.county || !address.county.trim()) {
    throw new Error("County is required.");
  }

  if (!address.estateOrLandmark || !address.estateOrLandmark.trim()) {
    throw new Error("Estate / landmark is required.");
  }

  if (!address.buildingOrHouse || !address.buildingOrHouse.trim()) {
    throw new Error("Building / house number is required.");
  }

  if (address.deliveryNotes && address.deliveryNotes.length > 200) {
    throw new Error("Delivery notes cannot exceed 200 characters.");
  }

  const emailVal = validateEmail(input.email ?? "");
  if (!emailVal.isValid || !emailVal.normalized) {
    throw new Error(emailVal.error ?? "Please enter a valid email address for your order receipt.");
  }
  const normalizedEmail = emailVal.normalized;

  if (input.paymentMethod === "mpesa" && input.mpesaPhone) {
    const mpesaVal = validateKenyanPhone(input.mpesaPhone);
    if (!mpesaVal.isValid) {
      throw new Error(mpesaVal.error ?? "Invalid M-Pesa phone number.");
    }
  }

  return await getShopApi().createOrder({
    ...input,
    email: normalizedEmail,
    address: {
      ...address,
      phone: phoneVal.normalized!,
    },
    mpesaPhone: input.mpesaPhone ? validateKenyanPhone(input.mpesaPhone).normalized : undefined,
  });
}

export async function getOrderAction(
  reference: string,
  accessToken?: string
): Promise<Order | null> {
  if (!reference || typeof reference !== "string") {
    return null;
  }
  return await getShopApi().getOrder(reference, accessToken);
}

export async function resendMpesaPromptAction(
  reference: string,
  accessToken: string
): Promise<Order> {
  if (!reference || !accessToken) {
    throw new Error("Order reference and access token are required.");
  }
  return await getShopApi().resendMpesaPrompt(reference, accessToken);
}

export async function switchOrderToCardAction(
  reference: string,
  accessToken: string
): Promise<{ authorizationUrl: string; order: Order }> {
  if (!reference || !accessToken) {
    throw new Error("Order reference and access token are required.");
  }
  return await getShopApi().switchOrderToCard(reference, accessToken);
}
