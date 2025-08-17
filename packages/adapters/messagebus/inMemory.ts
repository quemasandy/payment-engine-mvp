import type { MessageBusPort, PublishOptions } from "@ports/messageBusPort";

type Sub = { topic: string; handlers: ((p: any) => Promise<void>)[] };
const subs: Sub[] = [];

export const inMemoryBus = (): MessageBusPort => ({
  publish: async (topic: string, payload: unknown, _opts?: PublishOptions) => {
    const s = subs.find(s => s.topic === topic);
    if (!s) return;
    for (const h of s.handlers) await h(payload);
  },
  subscribe: async (subscription: string, handler: (p: any) => Promise<void>) => {
    let s = subs.find(s => s.topic === subscription);
    if (!s) { s = { topic: subscription, handlers: [] }; subs.push(s); }
    s.handlers.push(handler);
  },
});
