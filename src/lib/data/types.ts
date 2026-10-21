/** Amounts are in minor units (for example cents). Currency is an ISO 4217 code (for example "KES"). */
export interface Money {
  amount: number;
  currency: string;
}

export interface Media {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

/** One perfume, sold as a single 10ml decant (no size selector). */
export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  notes: ScentNotes;
  family?: string;
  images: Media[];
  /** Price of the 10ml decant. */
  price: Money;
  stock: StockStatus;
  /** Later phase (FR-20): the full-bottle product to link to. */
  fullBottleSlug?: string;
  rating?: { average: number; count: number };
}

export interface DiscoverySet {
  id: string;
  slug: string;
  name: string;
  description: string;
  productIds: string[];
  price: Money;
  image: Media;
}

export interface Review {
  id: string;
  productId?: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
}

export type CartItemKind = "product" | "set";

export interface CartLine {
  kind: CartItemKind;
  itemId: string;
  quantity: number;
}

export interface PricedCartLine extends CartLine {
  name: string;
  unitPrice: Money;
  available: boolean;
}

export interface ValidatedCart {
  lines: PricedCartLine[];
  subtotal: Money;
  issues: string[];
}

export type SortOption = "popular" | "price_asc" | "price_desc" | "name";

export interface ProductQuery {
  search?: string;
  brands?: string[];
  families?: string[];
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NewsletterInput {
  email: string;
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface FormSubmitResult {
  success: boolean;
  message: string;
}


export interface SearchSuggestion {
  id: string;
  slug: string;
  name: string;
  brand: string;
  family: string;
  price: number;
  inStock: boolean;
}

export interface ConsentChoice {
  analytics: boolean;
  updatedAt: string;
}

export type AnalyticsEventName =
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed";

export interface AnalyticsEventInput {
  event: AnalyticsEventName;
  itemKind?: "product" | "set";
  itemId?: string;
  value?: number;
  currency?: "KES";
}

export interface ConsentRecord {
  analytics: boolean;
  marketing: boolean;
  recordedAt: string;
}

// Checkout and Order contracts (FR-27, FR-28, FR-30, FR-37, FR-38)
export interface KenyaDeliveryAddress {
  fullName: string;
  phone: string;
  county: string;
  estateOrLandmark: string;
  buildingOrHouse: string;
  deliveryNotes?: string;
}

export type PaymentMethod = "mpesa" | "card";

export interface MpesaPaymentDetails {
  phone: string;
}

export interface CheckoutInput {
  items: { id: string; kind: "product" | "set"; quantity: number }[];
  address: KenyaDeliveryAddress;
  paymentMethod: PaymentMethod;
  mpesaPhone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  brand?: string;
  kind: "product" | "set";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  reference: string;
  accessToken?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: KenyaDeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
  paymentFailureReason?: string;
  fulfillmentStatus?: "processing" | "shipped" | "delivered";
  reservationExpiresAt?: string;
  chargeAttempts?: number;
  createdAt: string;
}
