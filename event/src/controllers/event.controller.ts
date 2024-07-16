import { Request } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { BasicMessageData } from '../types/message.types';
import { productPublished } from './zuora.product.controller';
import { customerCreated } from './zuora.account.controller';
import { orderCreated } from './zuora.order.controller';
import { readConfiguration } from '../utils/config.utils';
import { getCustomerById, getOrderById, getProductById } from './ct.controller';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request) => {
  logger.info('Event received: ' + request.body);
  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }
  logger.info('Message: ' + request.body.message);

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  // For our example we will use the customer id as a var
  // and the query the commercetools sdk with that info
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    const jsonData: BasicMessageData = JSON.parse(decodedData);
    logger.info('Notification type' + jsonData.notificationType);

    logger.info('Project key' + jsonData.projectKey);

    if (jsonData.projectKey !== readConfiguration().projectKey) {
      logger.error('Wrong project key');
      throw new CustomError(400, 'Bad request: Wrong project key');
    }
    switch (jsonData.resource.typeId) {
      case 'product': {
        const product = await getProductById(jsonData.resource.id);
        if (product) {
          logger.info('Product publishing starts: ' + product.id);
          await productPublished(product);
        }
        break;
      }
      case 'customer': {
        if (jsonData.notificationType !== 'ResourceCreated') {
          throw new CustomError(400, 'Bad request: Unknown notification type');
        }
        const customer = await getCustomerById(jsonData.resource.id);
        if (customer) {
          logger.info('Customer starts: ' + customer.id);
          await customerCreated(customer);
        }
        break;
      }
      case 'order': {
        if (jsonData.notificationType !== 'ResourceCreated') {
          throw new CustomError(400, 'Bad request: Unknown notification type');
        }
        const order = await getOrderById(jsonData.resource.id);
        if (order) {
          logger.info('Order starts: ' + order.id);

          await orderCreated(order);
        }
        break;
      }
      default:
        logger.error('Unknown message type');
        throw new CustomError(400, 'Bad request: Unknown message type');
    }
  }
};
