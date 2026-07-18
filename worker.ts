// Custom Worker entry: keep OpenNext fetch + add Cloudflare Cron.
// `.open-next/worker.js` is generated at build time.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from "./.open-next/worker.js";

type Env = {
  CRON_SECRET?: string;
};

export default {
  fetch: handler.fetch,

  /**
   * Cloudflare Cron Trigger (see wrangler.jsonc triggers.crons).
   * Invokes the same Next route used for manual/HTTP cron calls.
   *
   * Local test:
   *   npx wrangler dev --test-scheduled
   *   curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
   */
  async scheduled(
    _controller: { cron: string; scheduledTime: number },
    env: Env,
    ctx: { waitUntil(promise: Promise<unknown>): void }
  ) {
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

// Required when OpenNext generates these Durable Object exports.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";
