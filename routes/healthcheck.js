export default async function (fastify, opts) {
  fastify.get("/healthcheck", async function (request, reply) {
    // const date = new Intl.DateTimeFormat("en-US");
    // fastify.log.info({
    //   STATUS: "Healthcheck OK",
    //   REMOTE_ADDR: request.ip,
    //   TIMESTAMP: date.format(new Date()),
    // });
    reply.status(200).send({ status: "OK" });
  });
}
