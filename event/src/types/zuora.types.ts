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
  accountReceivableAccountingCodeId: string;
  accountingCode: string;
  applyToBillingPeriodPartially: boolean;
  billCycleType: string;
  billingPeriod: string;
  billingPeriodAlignment: string;
  billingTiming: string;
  chargeModel: string;
  chargeType: string;
  createdById: string;
  createdDate: string;
  defaultQuantity: number;
  deferredRevenueAccount: string;
  deferredRevenueAccountingCodeId: string;
  endDateCondition: string;
  excludeItemBillingFromRevenueAccounting: boolean;
  excludeItemBookingFromRevenueAccounting: boolean;
  id: string;
  includedUnits: number;
  isAllocationEligible: boolean;
  isCommitted: boolean;
  isPrepaid: boolean;
  isRollover: boolean;
  isStackedDiscount: boolean;
  isUnbilled: boolean;
  legacyRevenueReporting: boolean;
  listPriceBase: string;
  name: string;
  numberOfPeriod: number;
  overageCalculationOption: string;
  overageUnusedUnitsCreditOption: string;
  priceChangeOption: string;
  priceIncreasePercentage: number;
  priceUpsellQuantityStacked: boolean;
  productRatePlanChargeNumber: string;
  productRatePlanId: string;
  recognizedRevenueAccount: string;
  recognizedRevenueAccountingCodeId: string;
  revenueRecognitionRuleName: string;
  rolloverApply: string;
  rolloverPeriodLength: number;
  rolloverPeriods: number;
  taxable: boolean;
  triggerEvent: string;
  upToPeriodsType: string;
  updatedById: string;
  updatedDate: string;
  usageRecordRatingOption: string;
  useTenantDefaultForPriceChange: boolean;
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

export type ZuoraOrderCreatePayload = {
  description: string;
  existingAccountNumber: string;
  orderDate: string;
  orderLineItems?: Array<{
    billTo: string;
    billingTrigger: string;
    chargeAmountPerUnit: number;
    customFields?: {
      [key: string]: string;
    };
    currency: string;
    deferredRevenueAccountingCode: string;
    description: string;
    itemName: string;
    itemType: string;
    listPricePerUnit: number;
    ownerAccountNumber: string;
    productCode: string;
    purchaseOrderNumber: string;
    quantity: number;
    recognizedRevenueAccountingCode: string;
    revenueRecognitionRule: string;
    soldTo: string;
    taxCode: string;
    taxMode: string;
    transactionEndDate: string;
    transactionStartDate: string;
  }>;
  orderNumber?: string;
  processingOptions?: {
    applyCreditBalance: boolean;
    billingOptions: {
      creditMemoReasonCode: string;
      targetDate: string;
    };
    collectPayment: boolean;
    electronicPaymentOptions: {
      authTransactionId: string;
      gatewayOrderId: string;
      paymentGatewayId: string;
      paymentMethodId: string;
    };
    runBilling: boolean;
  };
  subscriptions?: Array<{
    orderActions: Array<{
      createSubscription: CreateOrderSubscriptionAction;
      triggerDates: Array<{
        name: string;
        triggerDate: string;
      }>;
      type: string;
    }>;
  }>;
};

export interface CreateOrderSubscriptionAction {
  subscribeToRatePlans: Array<{
    chargeOverrides?: Array<{
      productRatePlanChargeId: string;
      startDate: {
        triggerEvent: string;
      };
    }>;
    productRatePlanId: string;
    uniqueToken?: string;
    subscriptionRatePlanNumber?: string;
  }>;
  subscriptionNumber?: string;
  terms: {
    autoRenew: boolean;
    initialTerm: {
      period: number;
      periodType: string;
      startDate: string;
      termType: string;
    };
    renewalSetting: string;
    renewalTerms: Array<{
      period: number;
      periodType: string;
    }>;
  };
}

export type Order = {
  accountNumber: string;
  invoiceNumbers: string[];
  orderLineItems: {
    id: string;
    itemNumber: string;
  }[];
  orderNumber: string;
  paidAmount: number;
  paymentNumber: string;
  status: string;
  subscriptions?: {
    status: string;
    subscriptionNumber: string;
    subscriptionOwnerNumber: string;
    subscriptionOwnerId: string;
  }[];
  success: boolean;
};
