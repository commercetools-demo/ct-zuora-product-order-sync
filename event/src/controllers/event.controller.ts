import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { BasicMessageData } from '../types/message.types';
import { ProductCreatedMessage } from '@commercetools/platform-sdk';
import { productPublished } from './zuora.controller';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
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

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  // For our example we will use the customer id as a var
  // and the query the commercetools sdk with that info
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    const jsonData: BasicMessageData = JSON.parse(decodedData);
    switch (jsonData.type) {
      case 'ProductPublished':
        logger.info('Product publishing starts: ', jsonData.productProjection.id);
        productPublished(jsonData);
        break;

      case 'OrderCreated':
        break;
      default:
        logger.error('Unknown message type');
        throw new CustomError(400, 'Bad request: Unknown message type');
    }
  }

  // Return the response for the client
  response.status(204).send();
};
