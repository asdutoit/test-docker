export default async function (fastify, opts) {
  fastify.get("/", async (request, reply) => {
    fastify.log.info("/ Route Reached");
    reply.status(200).send("Hello World!");
  });

  fastify.get("/foo", (req, reply) => {
    const { activeSpan, tracer } = req.openTelemetry();
    const { redis } = fastify;
    fastify.log.info("Redis Get Request '/foo'", redis);
    const span = tracer.startSpan(`${activeSpan.name} - child process`);
    redis.get(req.query.key, (err, val) => {
      if (val === "") {
        reply.status(404).send("Not Found");
      } else {
        reply.send(err || val);
      }
    });
    span.end();
  });

  fastify.post("/foo", (req, reply) => {
    const { redis } = fastify;
    const { activeSpan, tracer } = req.openTelemetry();
    fastify.log.info("Redis Post Request '/foo'", redis);
    const span = tracer.startSpan(`${activeSpan.name} - child process`);
    redis.set(req.body.key, req.body.value, (err) => {
      reply.send(err || { status: "ok" });
    });
    span.end();
  });
}
