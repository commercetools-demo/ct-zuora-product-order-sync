import { Order as CommercetoolsOrder } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { CreateOrderSubscriptionAction, Order } from '../types/zuora.types';
import { logger } from '../utils/logger.utils';
import { validOrder } from '../validators/order-validator';
import { CURRENCY } from '../constants';
import { dummyAccountOptions } from './zuora.account.controller';
const zuoraClient = new ZuoraSandboxClient();

const findOrCreateAccount = async (
  order: CommercetoolsOrder
): Promise<void> => {
  try {
    await zuoraClient.getAccountByCustomerId(order.customerId!);
  } catch (error) {
    logger.info(`Customer not found. Creating account: ${order.customerId}`);
    await zuoraClient.createAccount({
      accountData: {
        accountNumber: order.customerId!,
        billCycleDay: 1,
        billToContact: {
          firstName: order.billingAddress?.firstName || '',
          lastName: order.billingAddress?.lastName || '',
          personalEmail: order.customerEmail || '',
          country: order.billingAddress?.country || 'US',
          state: order.billingAddress?.state || 'CA',
        },
        autoPay: false,
        currency: CURRENCY,
        name: order.customerEmail || '',
      },
      ...dummyAccountOptions,
    });
  }
};

const getOrderSubscriptionItems = async (
  order: CommercetoolsOrder
): Promise<CreateOrderSubscriptionAction[]> => {
  const subscriptions: CreateOrderSubscriptionAction[] = [];
  for await (const item of order.lineItems) {
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

  return subscriptions;
};

export const orderCreated = async (
  order: CommercetoolsOrder
): Promise<Order> => {
  if (!validOrder(order)) {
    throw new Error('Invalid order');
  }

  await findOrCreateAccount(order);

  const subscriptions: CreateOrderSubscriptionAction[] =
    await getOrderSubscriptionItems(order);

  const result = await zuoraClient.createOrder({
    orderNumber: order.id,
    description: order.id,
    existingAccountNumber: order.customerId!,
    orderDate: new Date().toISOString().split('T')[0],
    subscriptions: subscriptions.map((subscription) => ({
      orderActions: [
        {
          createSubscription: subscription,
          triggerDates: [
            {
              name: 'ContractEffective',
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
