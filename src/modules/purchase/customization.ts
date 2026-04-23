export type PurchaseCustomization = {
  isCustomized: boolean;
  surchargeAmount: number;
  /** Datos de camiseta personalizada (si aplica) */
  jerseyNumber?: string;
  jerseyName?: string;
};
