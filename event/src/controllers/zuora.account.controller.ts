import { CustomerCreatedMessagePayload } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { validCustomer } from '../utils/customer-validator.utils';
import { CURRENCY } from '../constants';
import { ZuoraCrudResponse, ZuoraSignupResponse } from '../types/zuora.types';
import { logger } from '../utils/logger.utils';
const zuoraClient = new ZuoraSandboxClient();

export const customerCreated = async (
  customerMessage: CustomerCreatedMessagePayload
): Promise<ZuoraSignupResponse> => {
  if (!validCustomer(customerMessage.customer)) {
    throw new Error('Invalid customer');
  }
  const result = await zuoraClient.createAccount({
    accountData: {
      accountNumber: customerMessage.customer.id,
      billCycleDay: 1,
      billToContact: {
        firstName: customerMessage.customer.firstName!,
        lastName: customerMessage.customer.lastName!,
        personalEmail: customerMessage.customer.email!,
        country: customerMessage.customer.addresses?.[0].country ?? 'US',
        state: customerMessage.customer.addresses?.[0].state ?? 'CA',
      },
      autoPay: false,
      // accountNumber: customerMessage.customer.id,
      currency: CURRENCY,
      name: customerMessage.customer.email,
    },
    options: {
      billingTargetDate: new Date().toISOString().split('T')[0],
      collectPayment: true,
      maxSubscriptionsPerAccount: 0,
      runBilling: true,
    },
    subscriptionData: {
      invoiceSeparately: false,

      startDate: new Date().toISOString().split('T')[0],
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
    },
  });

  logger.info(`Created account ${result.accountId}`);
  return result;
};
