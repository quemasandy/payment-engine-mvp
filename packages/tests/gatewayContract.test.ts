import { MockGateway } from "@gateways/mock";
test("GatewayPort contract - authorize happy path", async () => {
  const gw = MockGateway();
  const ok = await gw.authorize({ amount: 100, currency: "USD", originId:"o", idempotencyKey:"i", orderId:"ord", capture:false, token:{type:"network", token:"t"} } as any);
  expect(ok.ok).toBe(true);
});
