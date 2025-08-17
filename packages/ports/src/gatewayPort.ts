import type { CreatePaymentRequest, CreateRefundRequest } from "@domain/schemas";

export type AuthorizationResult = { ok: true; authCode: string } | { ok: false; reason: string };
export type CaptureResult = { ok: true; settlementId: string } | { ok: false; reason: string };
export type RefundResult = { ok: true; refundId: string } | { ok: false; reason: string };

export type GatewayPort = {
  name: string;
  authorize: (req: CreatePaymentRequest) => Promise<AuthorizationResult>;
  capture: (paymentId: string) => Promise<CaptureResult>;
  refund: (req: CreateRefundRequest) => Promise<RefundResult>;
};
