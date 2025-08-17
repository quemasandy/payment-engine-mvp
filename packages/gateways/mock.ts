import type { GatewayPort } from "@ports/gatewayPort";
import type { CreatePaymentRequest, CreateRefundRequest } from "@domain/schemas";

export const MockGateway = (): GatewayPort => ({
  name: "mock",
  authorize: async (req: CreatePaymentRequest) => {
    if (req.amount > 10000) return { ok: false as const, reason: "limit_exceeded" };
    return { ok: true as const, authCode: "AUTH-MOCK-12345" };
  },
  capture: async (_paymentId: string) => ({ ok: true as const, settlementId: "SETTLE-MOCK-1" }),
  refund: async (_req: CreateRefundRequest) => ({ ok: true as const, refundId: "REFUND-MOCK-1" }),
});
