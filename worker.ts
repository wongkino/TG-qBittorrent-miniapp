/* eslint-disable @typescript-eslint/ban-ts-comment -- OpenNext generated worker is untyped */
// @ts-nocheck
// Custom Worker entry: keep OpenNext fetch + add Cloudflare Cron.
// Built by Wrangler after OpenNext generates `.open-next/worker.js`.
import { default as handler } from "./.open-next/worker.js";

const worker = {
  fetch: handler.fetch,

  /**
   * Cloudflare Cron Trigger (see wrangler.jsonc triggers.crons).
   * Invokes the same Next route used for manual/HTTP cron calls.
   *
   * Local test:
   *   npx wrangler dev --test-scheduled
   *   curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
   */
  async scheduled(_controller, env, ctx) {
    const secret = env.CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
    if (!secret) {
      console.error("CRON_SECRET is not configured; skipping notify cron");
      return;
    }

    const request = new Request(
      "https://tg-dl.internal/api/cron/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      }
    );

    const response = await handler.fetch(request, env, ctx);
    const body = await response.text();
    if (!response.ok) {
      console.error(`Notify cron failed (${response.status}): ${body}`);
      throw new Error(`Notify cron failed (${response.status})`);
    }
    console.log(`Notify cron ok: ${body}`);
  },
};

export default worker;

// Required when OpenNext generates these Durable Object exports.
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";
