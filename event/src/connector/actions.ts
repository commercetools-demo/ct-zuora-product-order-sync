import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const ZUORA_SYNC_SUBSCRIPTION_KEY = 'zuora-sync-preview';

export async function createZuoraSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
): Promise<void> {
  await deleteZuoraSubscription(apiRoot);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: ZUORA_SYNC_SUBSCRIPTION_KEY,
        destination: {
          type: 'GoogleCloudPubSub',
          topic: topicName,
          projectId,
        },
        messages: [],
        changes: [
          {
            resourceTypeId: 'order',
          },
          {
            resourceTypeId: 'product',
          },
          {
            resourceTypeId: 'customer',
          },
        ],
      },
    })
    .execute();
}

export async function deleteZuoraSubscription(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${ZUORA_SYNC_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: ZUORA_SYNC_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
