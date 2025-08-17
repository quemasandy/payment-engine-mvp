export type ObjectStorePort = {
  put: (bucket: string, key: string, body: Buffer | string) => Promise<void>;
  get: (bucket: string, key: string) => Promise<Buffer | null>;
};
