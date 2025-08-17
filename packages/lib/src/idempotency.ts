import type { ConfigStorePort } from "@ports/configStorePort";

export const idempotencyMiddleware = (store: ConfigStorePort) =>
  async <T>(key: string, compute: () => Promise<T>, ttlSec = 24 * 3600): Promise<{hit:boolean; result:T}> => {
    const hit = await store.getIdempotency(key);
    if (hit) return { hit: true, result: hit as T };
    const res = await compute();
    const saved = await store.saveIdempotency(key, res, ttlSec);
    return { hit: !saved, result: res };
  };
