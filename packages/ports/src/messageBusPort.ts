export type PublishOptions = {
  fifo?: boolean;
  messageGroupId?: string;
  messageDeduplicationId?: string;
  attributes?: Record<string, string>;
};
export type MessageBusPort = {
  publish: (topic: string, payload: unknown, opts?: PublishOptions) => Promise<void>;
  subscribe?: (subscription: string, handler: (payload: any) => Promise<void>) => Promise<void>;
  ack?: (ctx: unknown) => Promise<void>;
};
