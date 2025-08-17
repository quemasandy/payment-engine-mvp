export type SecretStorePort = { get: (key: string) => Promise<string | undefined> };
