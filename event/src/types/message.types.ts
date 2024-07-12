import { OrderCreatedMessagePayload, ProductCreatedMessagePayload, ProductPublishedMessagePayload } from "@commercetools/platform-sdk";

export type BasicMessageData = ProductCreatedMessagePayload | ProductPublishedMessagePayload | OrderCreatedMessagePayload;