import { OrderCreatedMessagePayload } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import {
  CreateOrderSubscriptionAction,
  Order,
} from '../types/zuora.types';
import { logger } from '../utils/logger.utils';
import { validOrder } from '../utils/order-validator';
const zuoraClient = new ZuoraSandboxClient();

export const orderCreated = async (
  orderMessage: OrderCreatedMessagePayload
): Promise<Order> => {
  if (!validOrder(orderMessage.order)) {
    throw new Error('Invalid order');
  }

  const subscriptions: CreateOrderSubscriptionAction[] = [];

  for await (const item of orderMessage.order.lineItems) {
    const productPlanId = await zuoraClient
      .getPlanBySKU(item.variant.sku!)
      .then((result) => result?.id);
    subscriptions.push({
      terms: {
        autoRenew: false,
        initialTerm: {
          period: 6,
          periodType: 'Month',
          startDate: new Date().toISOString().split('T')[0],
          termType: 'TERMED',
        },
        renewalSetting: 'RENEW_WITH_SPECIFIC_TERM',
        renewalTerms: [
          {
            period: 6,
            periodType: 'Month',
          },
        ],
      },
      subscribeToRatePlans: [
        {
          productRatePlanId: productPlanId,
          subscriptionRatePlanNumber: await zuoraClient
            .getPriceByPlanId(productPlanId)
            .then((result) => result?.id),
        },
      ],
    });
  }

  const result = await zuoraClient.createOrder({
    orderNumber: orderMessage.order.id,
    description: orderMessage.order.id,
    existingAccountNumber: orderMessage.order.customerId!,
    orderDate: new Date().toISOString().split('T')[0],
    subscriptions: subscriptions.map((subscription) => ({
      orderActions: [
        {
          createSubscription: subscription,
          triggerDates: [
            {
              name: 'InitialTerm',
              triggerDate: new Date().toISOString().split('T')[0],
            },
          ],
          type: 'CreateSubscription',
        },
      ],
    })),
  });

  logger.info(`Created order ${result.orderNumber}`);
  return result;
};
