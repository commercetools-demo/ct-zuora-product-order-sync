import { ProductProjection } from '@commercetools/platform-sdk';
import { LOCALE } from '../controllers/zuora.controller';

export const validProduct = (productProjection: ProductProjection): boolean => {
  if (!productProjection.name?.[LOCALE]) {
    return false;
  }
  const sellableAttribute = productProjection.masterVariant?.attributes?.find(
    (attribute) => attribute.name === 'sellable'
  )

  if (!sellableAttribute || sellableAttribute.value === false) {
    return false;
  }

  return true;
};
