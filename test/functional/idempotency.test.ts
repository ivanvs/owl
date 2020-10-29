import { expect } from "chai";
import { makeProducerEnv } from "./support";

function test(backend: "Redis" | "In-Memory") {
  describe(backend + " > Idempotency", () => {
    const env = makeProducerEnv(backend === "In-Memory");

    beforeEach(env.setup);
    afterEach(env.teardown);

    describe("when enqueueing an already-existant ID", () => {
      describe("and override = true", () => {
        it("replaces existing job", async () => {
          await env.producer.enqueue({
            queue: "override-true-queue",
            id: "a",
            payload: "1",
          });

          await env.producer.enqueue({
            queue: "override-true-queue",
            id: "a",
            payload: "2",
            override: true,
          });

          const job = await env.producer.findById("override-true-queue", "a");
          expect(job.payload).to.equal("2");
        });
      });

      describe("and override = false", () => {
        it("is a no-op", async () => {
          await env.producer.enqueue({
            queue: "override-false-queue",
            id: "a",
            payload: "1",
          });

          await env.producer.enqueue({
            queue: "override-false-queue",
            id: "a",
            payload: "2",
            override: false,
          });

          const job = await env.producer.findById("override-false-queue", "a");
          expect(job.payload).to.equal("1");
        });
      });
    });
  });
}

test("Redis");
test("In-Memory");
