import type { OriginPolicy } from "@domain/schemas";
import type { GatewayPort } from "@ports/gatewayPort";
import { MockGateway } from "@gateways/mock";

export const makeGateway = (policy: OriginPolicy): GatewayPort => {
  const name = policy.gatewaySelector.value.toLowerCase();
  switch (name) {
    case "mock": return MockGateway();
    default: return MockGateway();
  }
};
