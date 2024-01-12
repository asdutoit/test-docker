import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  TraceIdRatioBasedSampler,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

// Configure a tracer provider.
const provider = new NodeTracerProvider({
  sampler: new TraceIdRatioBasedSampler(0.5),
});

const zipkinExporter = new ZipkinExporter({
  headers: {
    "my-header": "header-value",
  },
  url: "http://localhost:9411/api/v2/spans",
  serviceName: "basic-fastify",
});

// Add a span exporter.
// provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(zipkinExporter));

// Register a global tracer provider.
provider.register();

// Note: the above is just a basic example. fastify-opentelemetry is compatible with any
// @opentelemetry/api configuration.
