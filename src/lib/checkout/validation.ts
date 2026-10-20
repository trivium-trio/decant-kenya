export const KENYA_COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Machakos",
  "Kisumu",
  "Uasin Gishu",
  "Kajiado",
  "Kilifi",
  "Kakamega",
  "Meru",
  "Nyeri",
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kericho",
  "Kirinyaga",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Migori",
  "Murang'a",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans-Nzoia",
  "Turkana",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export function validateKenyanPhone(phone: string): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  // Remove whitespace, dashes, parentheses
  const cleaned = trimmed.replace(/[\s\-()]/g, "");

  // Formats:
  // 1) +254 7XXXXXXXX or +254 1XXXXXXXX
  if (/^\+254[17]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  // 2) 254 7XXXXXXXX or 254 1XXXXXXXX
  if (/^254[17]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `+${cleaned}` };
  }

  // 3) 07XXXXXXXX or 01XXXXXXXX
  if (/^0[17]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `+254${cleaned.slice(1)}` };
  }

  return {
    isValid: false,
    error: "Enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678).",
  };
}

export function formatPhoneDisplay(phone: string): string {
  const { isValid, normalized } = validateKenyanPhone(phone);
  if (!isValid || !normalized) return phone;
  // Format as 07XX XXX XXX for easy reading
  const local = `0${normalized.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
