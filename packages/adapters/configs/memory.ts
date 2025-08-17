import type { ConfigStorePort } from "@ports/configStorePort";
import type { Payment, CloudEvent, OriginPolicy } from "@domain/schemas";

const payments = new Map<string, Payment>();
const idem = new Map<string, any>();
const outbox: CloudEvent[] = [];
const origins = new Map<string, OriginPolicy>();

export const memoryConfig = (): ConfigStorePort => ({
  getOriginPolicy: async (originId) => origins.get(originId) ?? null,
  putPayment: async (p) => { payments.set(p.paymentId, p); },
  getPayment: async (id) => payments.get(id) ?? null,
  saveIdempotency: async (k, resp, _ttl) => {
    if (idem.has(k)) return false;
    idem.set(k, resp); return true;
  },
  getIdempotency: async (k) => idem.get(k) ?? null,
  outboxAdd: async (ev) => { outbox.push(ev); },
  outboxPullBatch: async (max) => outbox.splice(0, max),
  outboxDelete: async (_ids) => { /* no-op for memory */ },
});

export const memorySeedOrigin = (p: OriginPolicy) => { origins.set(p.originId, p); };
