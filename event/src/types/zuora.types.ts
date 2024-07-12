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

export type ZuoraSignupResponse = {
  orderNumber: string;
  status: string;
  accountNumber: string;
  accountId: string;
  subscriptionNumber: string;
  subscriptionId: string;
  success: boolean;
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

export type ZuoraAccountSignupPayload = {
  accountData?: {
    accountNumber: string;
    autoPay?: boolean;
    billCycleDay: number;
    billToContact: {
      country: string;
      firstName?: string;
      lastName?: string;
      state: string;
      personalEmail?: string;
    };
    currency: string;
    customFields?: {
      [key: string]: string;
    };
    name: string;
    paymentMethod?: {
      makeDefault?: boolean;
      secondTokenId?: string;
      tokenId?: string;
      type?: string;
    };
  };
  accountIdentifierField?: string; // Map to CT customer id
  options?: {
    billingTargetDate?: string;
    collectPayment?: boolean;
    maxSubscriptionsPerAccount?: number;
    runBilling?: boolean;
  };
  subscriptionData: {
    invoiceSeparately?: boolean;
    ratePlans?: {
      productRatePlanId?: string;
    }[];
    startDate?: string;
    terms?: {
      autoRenew?: boolean;
      initialTerm?: {
        period?: number;
        periodType?: string;
        startDate?: string;
        termType?: string;
      };
      renewalSetting?: string;
      renewalTerms?: {
        period?: number;
        periodType?: string;
      }[];
    };
  };
};
