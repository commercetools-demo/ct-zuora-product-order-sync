import { Customer } from '@commercetools/platform-sdk';
import ZuoraSandboxClient from '../apis/zuora.api';
import { validCustomer } from '../validators/customer-validator.utils';
import { CURRENCY } from '../constants';
import { ZuoraSignupResponse } from '../types/zuora.types';
import { logger } from '../utils/logger.utils';
const zuoraClient = new ZuoraSandboxClient();

export const customerCreated = async (
  customer: Customer
): Promise<ZuoraSignupResponse> => {
  if (!validCustomer(customer)) {
    throw new Error('Invalid customer');
  }
  const result = await zuoraClient.createAccount({
    accountData: {
      accountNumber: customer.id,
      billCycleDay: 1,
      billToContact: {
        firstName: customer.firstName!,
        lastName: customer.lastName!,
        personalEmail: customer.email!,
        country: customer.addresses?.[0].country ?? 'US',
        state: customer.addresses?.[0].state ?? 'CA',
      },
      autoPay: false,
      // accountNumber: customer.id,
      currency: CURRENCY,
      name: customer.email,
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
