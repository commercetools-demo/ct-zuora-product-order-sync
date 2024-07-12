import {
  ProductPublishedMessagePayload,
  ProductVariant,
} from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { logger } from '../utils/logger.utils';
import { ZuoraCrudResponse, ZuoraObjectQueryProduct } from '../types/zuora.types';
import { validProduct } from '../utils/product-validator.utils';
import { getPriceDetails } from '../utils/price.utils';
const zuoraClient = new ZuoraSandboxClient();

// Create a product

export const LOCALE = 'en-US';

export const productPublished = async (
  productMessage: ProductPublishedMessagePayload
): Promise<void> => {
  if (!validProduct(productMessage.productProjection)) {
    return;
  }
  const variants = (productMessage.productProjection.variants ?? []).concat(
    productMessage.productProjection.masterVariant
  );
  for await (const variant of variants) {
    if (!variant.sku) continue;
    await zuoraClient
      .getProductBySKU(variant.sku)
      .then((result) => {
        if (result) {
          logger.info(`Updating product`);

          return updateProduct(result, productMessage, variant);
        } else {
          logger.info(`Creating product`);
          return createProduct(productMessage, variant);
        }
      })
      .catch((error) => logger.error('Error creating product:', error));
  }
};

async function createPlan(variant: ProductVariant, productId: string): Promise<ZuoraCrudResponse> {
  return zuoraClient.getPlanByProductId(productId).then(async (plan) => {
    if (plan) {
      return {
        Id: plan.id,
        Success: true,
      }
    } else {
      const offerName = variant.attributes?.find(
        (attribute) => attribute.name === 'offeringName'
      )?.value;

      const planResult = await zuoraClient.createPlan({
        Name: offerName,
        ProductId: productId,
      });
      logger.info(`Created plan ${planResult.Id}`);

      return planResult;
    }
  });
}

async function createOrUpdatePrice(
  variant: ProductVariant,
  planResultId: string
) {
  if (variant.prices?.length === 0) return null;

  await zuoraClient
    .getPriceByPlanId(planResultId)
    .then(async (price) => {
      if (price) {
        const offerName = variant.attributes?.find(
          (attribute) => attribute.name === 'offeringName'
        )?.value;

        const priceDetails = getPriceDetails(variant);

        const priceResult = await zuoraClient.updatePrice(price.id, {
          ProductRatePlanId: planResultId,
          BillCycleType: 'DefaultFromCustomer',
          ChargeModel: 'Flat Fee Pricing',
          Name: offerName,
          UOM: 'each',
          UseDiscountSpecificAccountingCode: false,
          ...priceDetails,
        });
        logger.info(`Update price ${priceResult.Id}`);

        return priceResult;
      } else {
        const offerName = variant.attributes?.find(
          (attribute) => attribute.name === 'offeringName'
        )?.value;

        const priceDetails = getPriceDetails(variant);

        const priceResult = await zuoraClient.createPrice({
          ProductRatePlanId: planResultId,
          BillCycleType: 'DefaultFromCustomer',
          ChargeModel: 'Flat Fee Pricing',
          Name: offerName,
          UOM: 'each',
          UseDiscountSpecificAccountingCode: false,
          ...priceDetails,
        });
        logger.info(`Created price ${priceResult.Id}`);

        return priceResult;
      }
    })
    .catch((error) => logger.error('Error creating product:', error));
}

async function createProduct(
  productMessage: ProductPublishedMessagePayload,
  variant: ProductVariant
) {
  const productResult = await zuoraClient.createProduct({
    Description: productMessage.productProjection.description?.[LOCALE] || '',
    Name: productMessage.productProjection.name?.[LOCALE] || '',
    EffectiveStartDate: '2020-01-01',
    EffectiveEndDate: '2060-12-31',
    SKU: variant.sku!,
  });

  logger.info(`Created product ${productResult.Id}`);

  //   return productResult;
  const planResult = await createPlan(variant, productResult.Id);

  const createPriceResult = await createOrUpdatePrice(variant, planResult.Id);

  return createPriceResult;
}

async function updateProduct(
  result: ZuoraObjectQueryProduct,
  productMessage: ProductPublishedMessagePayload,
  variant: ProductVariant
) {
  const productResult = await zuoraClient.updateProductByID(result.id, {
    Description:
      productMessage.productProjection.description?.[LOCALE] ||
      result.description ||
      '',
    Id: result.id,
    Name: productMessage.productProjection.name?.[LOCALE] || result.name || '',
    SKU: variant.sku!,
  });

  //   return productResult;
  const planResult = await createPlan(variant, productResult.Id);

  const createPriceResult = await createOrUpdatePrice(variant, planResult.Id);

  return createPriceResult;
}
// export const orderCreated = async (
//   order: OrderCreatedMessagePayload
// ): Promise<void> => {
//   throw new Error('Not implemented');
// };
