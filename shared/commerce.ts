export type Mode = "demo" | "live";
export type MenuItem = {
  id: string;
  cafeId: string;
  name: string;
  description: string;
  category: string;
  priceMinor: number;
  available: boolean;
  mediaKey: string;
};
export type Cafe = {
  id: string;
  name: string;
  address: string;
  hours: string;
  deliveryMinor: number;
  mode: Mode;
};
export type CartLine = { itemId: string; quantity: number };
export type Quote = {
  lines: (CartLine & { name: string; unitPriceMinor: number })[];
  subtotalMinor: number;
  deliveryMinor: number;
  bonusPoints: number;
  maxBonusPoints: number;
  totalMinor: number;
  earnPoints: number;
  mode: "demo";
};
export type DemoOrder = {
  id: string;
  status: "demo_created";
  createdAt: string;
  quote: Quote;
  payment: { mode: "demo"; status: "not_charged" };
  idempotencyKey: string;
};
export type BonusTransaction = {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
  orderId?: string;
};
export type BonusAccount = {
  balance: number;
  maxPaymentPercent: number;
  transactions: BonusTransaction[];
  mode: "demo";
};
export type ExchangeTask = {
  id: string;
  title: string;
  category: string;
  description: string;
  budgetMinor: number;
  mode: "demo";
};
export type Booking = {
  id: string;
  providerId: string;
  providerName: string;
  slot: string;
  status: "demo_reserved";
  mode: "demo";
};
export type CommerceCatalog = {
  cafes: Cafe[];
  menu: MenuItem[];
  tasks: ExchangeTask[];
  slots: { providerId: string; times: string[] }[];
};
export type CommissionKind =
  | "exchange"
  | "food"
  | "booking"
  | "performer_promotion"
  | "ad_promotion"
  | "business_ads"
  | "affiliate"
  | "bonus";
export interface PaymentProvider {
  createIntent(input: {
    orderId: string;
    amountMinor: number;
    currency: "RUB";
    idempotencyKey: string;
  }): Promise<{
    mode: Mode;
    status: "not_charged" | "pending";
    providerId?: string;
  }>;
}
export interface StorageAdapter {
  resolve(key: string): string;
  createUpload(input: {
    key: string;
    contentType: string;
    size: number;
  }): Promise<{ url: string }>;
}
export interface PharmacyProvider {
  search(query: string): Promise<{
    mode: Mode;
    offers: {
      id: string;
      pharmacy: string;
      medicine: string;
      priceMinor: number;
      available: boolean;
    }[];
    orderingEnabled: boolean;
    deliveryEnabled: boolean;
  }>;
}
