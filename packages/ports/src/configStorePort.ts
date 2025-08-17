import type { OriginPolicy, Payment, CloudEvent } from "@domain/schemas";

export type ConfigStorePort = {
  getOriginPolicy: (originId: string) => Promise<OriginPolicy | null>;
  putPayment: (pmt: Payment) => Promise<void>;
  getPayment: (paymentId: string) => Promise<Payment | null>;
  saveIdempotency: (key: string, response: any, ttlSec: number) => Promise<boolean>;
  getIdempotency: (key: string) => Promise<any | null>;
  outboxAdd: (event: CloudEvent) => Promise<void>;
  outboxPullBatch: (max: number) => Promise<CloudEvent[]>;
  outboxDelete: (ids: string[]) => Promise<void>;
};
