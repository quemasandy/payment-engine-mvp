import { shape } from "@lib/responseShaper";
test("shape renames and omits", () => {
  const out = shape({ a: 1, b: 2, status: "authorized" }, { omit: ["b"], rename: { a: "x" }, mapStatus: { authorized: "approved" } } as any);
  expect(out).toEqual({ x: 1, status: "approved" });
});
