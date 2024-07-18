import {
  Customer,
  Order,
  ProductProjection,
} from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { logger } from '../utils/logger.utils';

async function retryPromise<T>(
  promiseFactory: () => Promise<T>,
  maxAttempts = 5,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await promiseFactory();
    } catch (error) {
      lastError = error as Error;
      logger.info(`Attempt ${attempt} failed. Retrying...`);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `All ${maxAttempts} attempts failed. Last error: ${lastError?.message}`
  );
}

export const getProductById = async (
  id: string
): Promise<ProductProjection | null> => {
  try {
    const product = await retryPromise(() =>
      createApiRoot()
        .productProjections()
        .get({
          queryArgs: {
            where: `id="${id}"`,
          },
        })
        .execute()
    ).then((result) => result.body.results?.[0]);

    return product;
  } catch (error) {
    logger.error('cannot find product by id ' + id);
    return null;
  }
};
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const order = await retryPromise(() =>
      createApiRoot().orders().withId({ ID: id }).get().execute()
    ).then((result) => result.body);

    return order;
  } catch (error) {
    logger.error('cannot find order by id ' + id);
    console.error(error);
    return null;
  }
};
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const customer = await retryPromise(() =>
      createApiRoot().customers().withId({ ID: id }).get().execute()
    ).then((result) => result.body);

    return customer;
  } catch (error) {
    logger.error('cannot find customer by id ' + id);
    return null;
  }
};
