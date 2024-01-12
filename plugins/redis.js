import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";
import IORedis from "ioredis";

async function redisPlugin(fastify, opts, done) {
  try {
    const redis = new IORedis({
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      host: process.env.REDIS_URL,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      namespace: "Redis Main Plugin",
    });

    redis.on("error", (err) => {
      console.log("fastify error", err);
      fastify.log.error({ actor: "Redis" }, `Fastify Error: ${err}`);
    });
    redis.on("connect", (info) => {
      console.log("connected to redis");
      fastify.log.info({ actor: "Redis" }, "connected");
    });
    fastify.addHook("onClose", () => redis.quit());
    fastify.register(fastifyRedis, { client: redis, closeClient: true });
    done();
  } catch (error) {
    console.error("Redis Plugin Error", error);
  }
}

export default fp(redisPlugin, { name: "redisPlugin" });
