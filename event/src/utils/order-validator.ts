import { OrderCreatedMessagePayload } from '@commercetools/platform-sdk';

export const validOrder = (
  order: OrderCreatedMessagePayload['order']
): boolean => {
  if (!order.billingAddress?.country) {
    return false;
  }
  return true;
};
