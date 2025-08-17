import type { ResponseShape } from "@domain/schemas";

export const shape = <T extends Record<string, any>>(obj: T, s: ResponseShape): any => {
  let out: Record<string, any> = { ...obj };
  for (const k of s.omit ?? []) delete out[k];
  for (const [from, to] of Object.entries(s.rename ?? {})) {
    if (from in out) { out[to] = out[from]; delete out[from]; }
  }
  if (out.status && s.mapStatus && (s.mapStatus as any)[out.status]) {
    out.status = (s.mapStatus as any)[out.status];
  }
  return out;
};
