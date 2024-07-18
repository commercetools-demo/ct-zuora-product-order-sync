import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { logger } from '../utils/logger.utils';
import {
  ZuoraCrudResponse,
  ZuoraObjectQueryProduct,
} from '../types/zuora.types';
import { validProduct } from '../validators/product-validator.utils';
import { getPriceDetails } from '../utils/price.utils';
import { LOCALE } from '../constants';
const zuoraClient = new ZuoraSandboxClient();

export const productPublished = async (
  product: ProductProjection
): Promise<void> => {
  logger.info(`validating product: ${product.id}`);
  if (!validProduct(product)) {
    return;
  }
  const variants = (product.variants ?? []).concat(product.masterVariant);

  await Promise.all(
    variants
      .filter((variant) => variant.sku)
      .map((variant) => createOrUpdateProduct(product, variant))
  );
};

async function createOrGetPlan(
  variant: ProductVariant,
  productId: string
): Promise<ZuoraCrudResponse> {
  return zuoraClient.getPlanByProductId(productId).then(async (plan) => {
    if (plan) {
      return {
        Id: plan.id,
        Success: true,
      };
    } else {
      const offerName = variant.attributes?.find(
        (attribute) => attribute.name === 'offeringName'
      )?.value;

      if (!offerName) {
        throw new Error('Offering name not found');
      }

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
        // Delete price

        await zuoraClient.deletePrice(price.id);
        logger.info(`Deleted price ${price.id}`);
      }
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
    })
    .catch((error) => logger.error('Error creating product:', error));
}

async function createOrUpdateProduct(
  product: ProductProjection,
  variant: ProductVariant
) {
  await zuoraClient
    .getProductBySKU(variant.sku!)
    .then((zuoraProduct) => {
      if (zuoraProduct) {
        logger.info(`Updating product + variant ${variant.sku}`);

        return updateProduct(zuoraProduct, product, variant);
      } else {
        logger.info(`Creating product + variant ${variant.sku}`);
        return createProduct(product, variant);
      }
    })
    .catch(() =>
      logger.error(
        'Error creating product: ' + product.id + ' with variant ' + variant.sku
      )
    );
}

async function createProduct(
  product: ProductProjection,
  variant: ProductVariant
) {
  const productResult = await zuoraClient.createProduct({
    Description: product.description?.[LOCALE] || '',
    Name: product.name?.[LOCALE] || '',
    EffectiveStartDate: '2020-01-01',
    EffectiveEndDate: '2060-12-31',
    SKU: variant.sku!,
  });

  logger.info(`Created product ${productResult.Id}`);

  const planResult = await createOrGetPlan(variant, productResult.Id);

  const createPriceResult = await createOrUpdatePrice(variant, planResult.Id);

  return createPriceResult;
}

async function updateProduct(
  zuoraProduct: ZuoraObjectQueryProduct,
  product: ProductProjection,
  variant: ProductVariant
) {
  if (
    zuoraProduct?.description !== product.description?.[LOCALE] ||
    zuoraProduct?.name !== product.name?.[LOCALE]
  ) {
    await zuoraClient.updateProductByID(zuoraProduct.id, {
      Description:
        product.description?.[LOCALE] || zuoraProduct.description || '',
      Id: zuoraProduct.id,
      Name: product.name?.[LOCALE] || zuoraProduct.name || '',
      SKU: variant.sku!,
    });
  }

  //   return productResult;
  const planResult = await createOrGetPlan(variant, zuoraProduct.id);

  const createPriceResult = await createOrUpdatePrice(variant, planResult.Id);

  return createPriceResult;
}
