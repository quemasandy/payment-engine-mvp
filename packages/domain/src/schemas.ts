import { z } from "zod";

export const Token = z.object({
  type: z.enum(["network", "vault"]),
  token: z.string().min(1),
  brand: z.string().optional(),
  last4: z.string().min(4).max(4).optional(),
  expMonth: z.number().int().min(1).max(12).optional(),
  expYear: z.number().int().min(2024).max(2100).optional(),
});

export const CreatePaymentRequest = z.object({
  originId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  orderId: z.string().min(1),
  capture: z.boolean().default(false),
  token: Token,
  metadata: z.record(z.any()).optional(),
});
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequest>;

export const PaymentStatus = z.enum(["requested", "authorized", "settled", "failed"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const Payment = z.object({
  paymentId: z.string(),
  status: PaymentStatus,
  amount: z.number().int(),
  currency: z.string(),
  originId: z.string(),
  gateway: z.string().optional(),
  authCode: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Payment = z.infer<typeof Payment>;

export const CreateRefundRequest = z.object({
  originId: z.string(),
  idempotencyKey: z.string(),
  paymentId: z.string(),
  amount: z.number().int().positive(),
  metadata: z.record(z.any()).optional(),
});
export type CreateRefundRequest = z.infer<typeof CreateRefundRequest>;

export const CloudEvent = z.object({
  specversion: z.literal("1.0"),
  id: z.string(),
  type: z.string(),
  source: z.string(),
  subject: z.string().optional(),
  datacontenttype: z.string().default("application/json"),
  time: z.string(),
  traceparent: z.string().optional(),
  data: z.record(z.any()),
});
export type CloudEvent = z.infer<typeof CloudEvent>;

export const RetryProfile = z.object({
  strategy: z.enum(["exponential", "fixed"]).default("exponential"),
  maxAttempts: z.number().int().min(0).default(6),
  baseDelayMs: z.number().int().min(0).default(200),
});
export type RetryProfile = z.infer<typeof RetryProfile>;

export const ResponseShape = z.object({
  omit: z.array(z.string()).default([]),
  rename: z.record(z.string()).default({}),
  mapStatus: z.record(z.string()).default({}),
});
export type ResponseShape = z.infer<typeof ResponseShape>;

export const OriginPolicy = z.object({
  originId: z.string(),
  locale: z.string().default("en-US"),
  currency: z.string().length(3),
  responseShape: ResponseShape.default({ omit: [], rename: {}, mapStatus: {} }),
  gatewaySelector: z.object({
    type: z.enum(["static", "byAmount", "byCurrency"]).default("static"),
    value: z.string().default("mock"),
  }),
  fraudRules: z.record(z.any()).default({}),
  retryProfile: RetryProfile.default({}),
  webhooks: z.object({
    url: z.string().url().optional(),
    auth: z.string().optional(),
  }).default({}),
  queueType: z.enum(["standard", "fifo"]).default("standard"),
});
export type OriginPolicy = z.infer<typeof OriginPolicy>;
