import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

export const startOTel = () => {
  try {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
    const service = process.env.SERVICE_NAME ?? "payment-engine-lite";
    const env = process.env.DD_ENV ?? process.env.NODE_ENV ?? "dev";
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: service,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env,
      "service.version": process.env.SERVICE_VERSION ?? "0.1.0",
    });
    const sdk = new NodeSDK({
      resource,
      traceExporter: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ? new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }) : undefined,
      metricReader: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT }),
      }) : undefined,
    });
    sdk.start();
    return sdk;
  } catch {
    return { shutdown: async () => {} } as any;
  }
};
