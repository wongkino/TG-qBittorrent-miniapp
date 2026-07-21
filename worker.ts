/* eslint-disable @typescript-eslint/ban-ts-comment -- OpenNext generated worker is untyped */
// @ts-nocheck
// Custom Worker entry wrapping OpenNext handler + Durable Object exports.
import { default as handler } from "./.open-next/worker.js";

export default handler;

// Required when OpenNext generates these Durable Object exports.
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";
