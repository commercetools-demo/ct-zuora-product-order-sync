import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { logger } from '../utils/logger.utils';
import {
  ZuoraObjectQueryProduct,
  ZuoraObjectQueryProductRatePlan,
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
): Promise<ZuoraObjectQueryProductRatePlan> {
  return zuoraClient.getPlanByProductId(productId).then(async (plan) => {
    if (plan) {
      return plan;
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

      return zuoraClient.getPlanByProductId(productId);
    }
  });
}

async function createOrUpdatePrice(
  variant: ProductVariant,
  plan: ZuoraObjectQueryProductRatePlan
) {
  if (variant.prices?.length === 0) return null;

  const offerName = variant.attributes?.find(
    (attribute) => attribute.name === 'offeringName'
  )?.value;

  const noRatePlanCharge = plan.productRatePlanCharges?.length === 0;

  if (noRatePlanCharge) {
    // Create price
    const priceDetails = getPriceDetails(variant);

    const priceResult = await zuoraClient.createPrice({
      ProductRatePlanId: plan.id,
      BillCycleType: 'DefaultFromCustomer',
      ChargeModel: 'Flat Fee Pricing',
      Name: offerName,
      UOM: 'each',
      UseDiscountSpecificAccountingCode: false,
      ...priceDetails,
    });
    logger.info(`Created price ${priceResult.Id}`);
    return;
  }

  const ratePlanCharge = plan.productRatePlanCharges?.[0];

  if (
    ratePlanCharge.pricing?.[0]?.price?.toFixed(2) !==
    ((variant.prices?.[0].value?.centAmount ?? 0) / 100).toFixed(2)
  ) {
    logger.info(`Price with different value found`);
    await zuoraClient.deletePrice(ratePlanCharge.id);
    logger.info(`Deleted price ${ratePlanCharge.id}`);
    const priceDetails = getPriceDetails(variant);

    const priceResult = await zuoraClient.createPrice({
      ProductRatePlanId: plan.id,
      BillCycleType: 'DefaultFromCustomer',
      ChargeModel: 'Flat Fee Pricing',
      Name: offerName,
      UOM: 'each',
      UseDiscountSpecificAccountingCode: false,
      ...priceDetails,
    });
    logger.info(`Created price ${priceResult.Id}`);
    return;
  }
  logger.info(`Price already exists ${ratePlanCharge.id}`);
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

  const createPriceResult = await createOrUpdatePrice(variant, planResult);

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

  const createPriceResult = await createOrUpdatePrice(variant, planResult);

  return createPriceResult;
}
