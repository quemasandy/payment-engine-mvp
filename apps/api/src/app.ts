import express from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { CreatePaymentRequest, CreateRefundRequest, Payment } from "@domain/schemas";
import { memoryConfig, memorySeedOrigin } from "@adapters/configs/memory";
import { inMemoryBus } from "@adapters/messagebus/inMemory";
import { idempotencyMiddleware } from "@lib/idempotency";
import { makeGateway } from "@lib/originRouter";
import { shape } from "@lib/responseShaper";
import { startOTel } from "@lib/otel";

const otel = startOTel();

const app = express();
app.use(express.json({ limit: "1mb" }));

// redact tokens in logs/outputs
const redact = (s: any) => JSON.parse(JSON.stringify(s, (k, v) => (k === "token" ? "[REDACTED]" : v)));

const store = memoryConfig();
const bus = inMemoryBus();

// seed origin policy for local dev
memorySeedOrigin({
  originId: "originA",
  locale: "es-EC",
  currency: "USD",
  responseShape: { omit: ["authCode"], rename: { paymentId: "id" }, mapStatus: { authorized: "approved" } },
  gatewaySelector: { type: "static", value: "mock" },
  fraudRules: {},
  retryProfile: { strategy: "exponential", maxAttempts: 6, baseDelayMs: 200 },
  webhooks: {},
  queueType: "standard",
});

const idem = idempotencyMiddleware(store);

app.post("/payments", async (req, res) => {
  const mode = (req.query.mode as string) ?? "async";
  const idk = (req.headers["idempotency-key"] as string) || req.body.idempotencyKey;
  if (!idk) return res.status(422).json({ error: "Idempotency-Key required" });

  const parsed = CreatePaymentRequest.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.flatten() });
  const body = parsed.data;

  const policy = await store.getOriginPolicy(body.originId);
  if (!policy) return res.status(422).json({ error: "Unknown originId" });

  const exec = async () => {
    const paymentId = randomUUID();
    const now = new Date().toISOString();
    const gateway = makeGateway(policy);
    if (mode === "sync") {
      const auth = await gateway.authorize(body);
      let status: Payment["status"] = auth.ok ? "authorized" : "failed";
      const p: Payment = { paymentId, status, amount: body.amount, currency: body.currency, originId: body.originId, gateway: gateway.name, authCode: auth.ok ? auth.authCode : null, createdAt: now, updatedAt: now };
      await store.putPayment(p);
      const shaped = shape(p, policy.responseShape);
      return { code: auth.ok ? 201 : 422, body: shaped };
    } else {
      const ev = {
        specversion: "1.0",
        id: randomUUID(),
        type: "PaymentRequested",
        source: "payment-engine-lite/api",
        time: now,
        data: { paymentId, request: { ...body, token: { ...body.token, token: "[REDACTED]" } }, originId: body.originId, idempotencyKey: idk },
      };
      await store.outboxAdd(ev as any);
      await bus.publish("payments.requested", ev);
      const resp = { paymentId, status: "accepted", traceId: req.headers["x-trace-id"] ?? "" };
      return { code: 202, body: resp };
    }
  };

  const { hit, result } = await idem(idk, exec);
  if (hit) return res.status(409).json({ idempotency: "hit", result });
  const { code, body } = result as any;
  return res.status(code).json(redact(body));
});

app.get("/payments/:id", async (req, res) => {
  const p = await store.getPayment(req.params.id);
  if (!p) return res.status(404).json({ error: "not_found" });
  return res.json(p);
});

app.post("/refunds", async (req, res) => {
  const idk = (req.headers["idempotency-key"] as string) || req.body.idempotencyKey;
  if (!idk) return res.status(422).json({ error: "Idempotency-Key required" });
  const parsed = CreateRefundRequest.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.flatten() });
  const exec = async () => {
    const ev = { specversion: "1.0", id: randomUUID(), type: "RefundRequested", source: "payment-engine-lite/api", time: new Date().toISOString(), data: parsed.data };
    await store.outboxAdd(ev as any);
    await bus.publish("refunds.requested", ev);
    return { code: 202, body: { status: "accepted" } };
  };
  const { result } = await idem(idk, exec);
  const { code, body } = result as any;
  return res.status(code).json(body);
});

app.post("/webhooks/gateway", async (_req, res) => res.status(204).end());

export const server = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API on :${port}`));
  process.on("SIGINT", async () => { await otel.shutdown(); process.exit(0); });
}
