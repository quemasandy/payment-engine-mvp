export type LoggerPort = {
  info: (msg: string, meta?: Record<string, any>) => void;
  warn: (msg: string, meta?: Record<string, any>) => void;
  error: (msg: string, meta?: Record<string, any>) => void;
};
