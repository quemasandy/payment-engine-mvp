import { inMemoryBus } from "@adapters/messagebus/inMemory";
import { memoryConfig } from "@adapters/configs/memory";
import { makeGateway } from "@lib/originRouter";
import { Payment } from "@domain/schemas";

const bus = inMemoryBus();
const store = memoryConfig();

const handler = async (ev: any) => {
  const { paymentId, request, originId, idempotencyKey } = ev.data;
  const policy = await store.getOriginPolicy(originId);
  if (!policy) return;
  const gateway = makeGateway(policy);
  const auth = await gateway.authorize(request);
  const now = new Date().toISOString();
  const status: Payment["status"] = auth.ok ? "authorized" : "failed";
  await store.putPayment({
    paymentId, status, amount: request.amount, currency: request.currency, originId, gateway: gateway.name,
    authCode: auth.ok ? auth.authCode : null, createdAt: now, updatedAt: now,
  });
  await bus.publish("payments.processed", {
    specversion: "1.0", id: paymentId, type: auth.ok ? "PaymentAuthorized" : "PaymentFailed",
    source: "payment-engine-lite/worker", time: now, data: { paymentId, originId, idempotencyKey },
  });
};

export const start = async () => {
  await bus.subscribe!("payments.requested", handler);
  console.log("paymentsWorker subscribed");
};
if (require.main === module) start();
