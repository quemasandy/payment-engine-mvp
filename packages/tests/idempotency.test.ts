import { memoryConfig } from "@adapters/configs/memory";
import { idempotencyMiddleware } from "@lib/idempotency";

test("idempotency returns hit on second call", async () => {
  const store = memoryConfig();
  const idem = idempotencyMiddleware(store);
  const exec = () => Promise.resolve({ ok: true });
  const r1 = await idem("k1", exec);
  const r2 = await idem("k1", exec);
  expect(r1.hit).toBe(false);
  expect(r2.hit).toBe(true);
});
