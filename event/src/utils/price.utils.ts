import { ProductVariant } from '@commercetools/platform-sdk';

export const getPriceDetails = (variant: ProductVariant) => {
  // Here we can decide based on variant attributes what kind of price we need to create
  // Now dummy data
  const result = {
    AccountingCode: 'Deferred Revenue',
    DeferredRevenueAccount: 'Deferred Revenue',
    RecognizedRevenueAccount: 'Accounts Receivable',
    BillingPeriod: 'Month',
    ChargeType: 'Recurring',
    ProductRatePlanChargeTierData: {
      ProductRatePlanChargeTier: variant.prices!.map((price) => ({
        Currency: price.value?.currencyCode,
        Price: price.value?.centAmount / 100,
      })),
    },
    TriggerEvent: 'ContractEffective',
  };
  return result;
};
