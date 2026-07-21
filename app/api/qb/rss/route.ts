import { jsonOk, withAuth } from "@/lib/api";
import { mockRssFeeds } from "@/lib/dev/preview";
import { listRssFeeds } from "@/lib/qbittorrent";

export const GET = withAuth(
  async () => jsonOk({ feeds: await listRssFeeds() }),
  () => ({ feeds: mockRssFeeds() })
);
