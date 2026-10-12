import type {
  PaymentProvider,
  StorageAdapter,
  PharmacyProvider,
  CommissionKind,
} from "../../shared/commerce";
export const paymentProvider: PaymentProvider = {
  async createIntent() {
    return { mode: "demo", status: "not_charged" };
  },
};
export const storage: StorageAdapter = {
  resolve(key) {
    // Only approved, attributed photos may be resolved. No generated fallback.
    void key;
    return "";
  },
  async createUpload() {
    throw new Error("Загрузка отключена до подключения объектного хранилища");
  },
};
export const pharmacy: PharmacyProvider = {
  async search() {
    return {
      mode: "demo",
      offers: [],
      orderingEnabled: false,
      deliveryEnabled: false,
    };
  },
};
export const monetization: Record<
  CommissionKind,
  { enabled: boolean; rateBps: number }
> = {
  exchange: { enabled: false, rateBps: 0 },
  food: { enabled: false, rateBps: 0 },
  booking: { enabled: false, rateBps: 0 },
  performer_promotion: { enabled: false, rateBps: 0 },
  ad_promotion: { enabled: false, rateBps: 0 },
  business_ads: { enabled: false, rateBps: 0 },
  affiliate: { enabled: false, rateBps: 0 },
  bonus: { enabled: false, rateBps: 0 },
};
