import {
  CustomerCreatedMessagePayload,
  OrderCreatedMessagePayload,
  ProductPublishedMessagePayload,
} from '@commercetools/platform-sdk';

export type BasicMessageData =
  | CustomerCreatedMessagePayload
  | ProductPublishedMessagePayload
  | OrderCreatedMessagePayload;
