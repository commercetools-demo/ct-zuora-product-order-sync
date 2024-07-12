import { CustomerCreatedMessagePayload } from '@commercetools/platform-sdk';

export const validCustomer = (
  customer: CustomerCreatedMessagePayload['customer']
): boolean => {
  if (!customer.email) {
    return false;
  }
  if (!customer.firstName || !customer.lastName) {
    return false;
  }
  if (!customer.addresses?.length) {
    if (!customer.addresses?.some((address) => address.country)) {
      return false;
    }
  }
  return true;
};
