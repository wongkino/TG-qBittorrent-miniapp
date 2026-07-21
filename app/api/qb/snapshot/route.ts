import { jsonOk, withAuth } from "@/lib/api";
import { mockCategories, mockTorrents } from "@/lib/dev/preview";
import { listCategories, listTorrents } from "@/lib/qbittorrent";

/** Single round-trip for UI boot / manual refresh (torrents + categories). */
export const GET = withAuth(
  async () => {
    const [torrents, categories] = await Promise.all([
      listTorrents(),
      listCategories(),
    ]);
    return jsonOk({ torrents, categories });
  },
  () => ({
    torrents: mockTorrents(),
    categories: mockCategories(),
  })
);
