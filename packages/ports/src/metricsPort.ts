export type MetricsPort = {
  increment: (name: string, tags?: string[], value?: number) => void;
  gauge: (name: string, value: number, tags?: string[]) => void;
  timing: (name: string, ms: number, tags?: string[]) => void;
};
