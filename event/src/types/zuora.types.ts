export type ZuoraObjectQueryProduct = {
  allowFeatureChanges: boolean;
  createdById: string;
  createdDate: string;
  description: string;
  effectiveEndDate: string;
  effectiveStartDate: string;
  id: string;
  name: string;
  productNumber: string;
  SKU: string;
  updatedById: string;
  updatedDate: string;
};

export type ZuoraObjectQueryProductRatePlan = {
  id: string;
};

export type ZuoraObjectQueryProductRateChargePlan = {
  id: string;
};

export type ZuoraProductUpdatePayload = {
  Description: string;
  EffectiveEndDate?: string;
  EffectiveStartDate?: string;
  Id: string;
  Name: string;
  SKU: string;
};

export type ZuoraCrudResponse = {
  Id: string;
  Success: boolean;
};

export type ZuoraProductRatePlanPayload = {
  Description?: string;
  EffectiveEndDate?: string;
  EffectiveStartDate?: string;
  Grade?: number;
  Name: string;
  ProductId: string;
};

export type ZuoraProductRatePlanChargePayload = {
  AccountingCode?: string;
  BillCycleType: string;
  BillingPeriod: string;
  ChargeModel: string;
  ChargeType: string;
  DeferredRevenueAccount?: string;
  Name: string;
  ProductRatePlanChargeTierData: {
    ProductRatePlanChargeTier: Array<{
      Currency: string;
      Price: number;
    }>;
  };
  ProductRatePlanId: string;
  RecognizedRevenueAccount?: string;
  TriggerEvent: string;
  UOM?: string;
  UseDiscountSpecificAccountingCode: boolean;
};
