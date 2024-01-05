import * as dotenv from "dotenv";
import Fastify from "fastify";
import redis from "./plugins/redis.js";
import metrics from "./plugins/prometheus.js";
import healthcheck from "./routes/healthcheck.js";
import { v4 as uuidv4 } from "uuid";
import pino from "pino";

dotenv.config();

const {
  ADDRESS = "localhost",
  PORT = "3000",
  REDIS_URL = "127.0.0.1",
  REDIS_PORT = "6379",
  REDIS_USERNAME = "",
  REDIS_PASSWORD = "",
  LOKI_URL = "http://localhost",
  LOKI_PORT = "3100",
  NODE_ENV = "development",
} = process.env;

console.log("REDIS URL =======>", REDIS_URL);
console.log("REDIS PORT =======>", REDIS_PORT);

const pinoLokiTransport = pino.transport({
  target: "pino-loki",
  formatters: {
    level: (label) => {
      return { severity: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  options: {
    host: `${LOKI_URL}:${LOKI_PORT}`, // Update the variables directly
    labels: { application: "fastify-basic" },
  },
});

const pinoPretty = pino.transport({
  target: "pino-pretty",
  formatters: {
    level: (label) => {
      return { severity: label.toUpperCase() };
    },
  },
  options: {
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
    colorize: true,
    singleLine: true,
  },
});

const streams = [
  { level: "info", stream: pinoLokiTransport },
  { level: "info", stream: pinoPretty },
];
const stream = [{ level: "info", stream: pinoLokiTransport }];

const envToLogger = {
  development: {
    redact: ["headers.authorization", "headers.cookie"],
    stream: pino.multistream(streams),
    level: "trace", // Set global log level across all transports
  },
  production: {
    redact: ["headers.authorization", "headers.cookie"],
    stream: pino.multistream(stream),
  },
  test: false,
};

const fastify = Fastify({
  logger: envToLogger[NODE_ENV] ?? "false",
  disableRequestLogging: true,
  genReqId(req) {
    return uuidv4();
  },
});

// const fastify = Fastify({
//   logger: "false",
// });

fastify.register(metrics).register(healthcheck).register(redis);

fastify.get("/", async (request, reply) => {
  fastify.log.info("/ Route Reached");
  reply.status(200).send("Hello World!");
});

fastify.get("/foo", (req, reply) => {
  const { redis } = fastify;
  fastify.log.info("Redis Get Request '/foo'", redis);
  redis.get(req.query.key, (err, val) => {
    if (val === "") {
      reply.status(404).send("Not Found");
    } else {
      reply.send(err || val);
    }
  });
});

fastify.post("/foo", (req, reply) => {
  const { redis } = fastify;
  fastify.log.info("Redis Post Request '/foo'", redis);
  redis.set(req.body.key, req.body.value, (err) => {
    reply.send(err || { status: "ok" });
  });
});

const start = async () => {
  try {
    await fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) });
    console.log(`Server listening at ${ADDRESS}:${PORT}`);
  } catch (err) {
    console.error("Fastify Startup Error", err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
