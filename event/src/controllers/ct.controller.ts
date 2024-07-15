import {
  Customer,
  Order,
  ProductProjection,
} from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { logger } from '../utils/logger.utils';

export const getProductById = async (
  id: string
): Promise<ProductProjection | null> => {
  try {
    const product = await createApiRoot()
      .productProjections()
      .get({
        queryArgs: {
          where: `id="${id}"`,
        },
      })
      .execute()
      .then((result) => result.body.results?.[0]);

    return product;
  } catch (error) {
    logger.error('cannot find product by id', id);
    return null;
  }
};
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const order = await createApiRoot()
      .orders()
      .withId({ ID: id })
      .get()
      .execute()
      .then((result) => result.body);

    return order;
  } catch (error) {
    logger.error('cannot find order by id', id);
    return null;
  }
};
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const customer = await createApiRoot()
      .customers()
      .withId({ ID: id })
      .get()
      .execute()
      .then((result) => result.body);

    return customer;
  } catch (error) {
    logger.error('cannot find customer by id', id);
    return null;
  }
};
