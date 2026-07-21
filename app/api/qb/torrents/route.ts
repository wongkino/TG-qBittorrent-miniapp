import { jsonOk, withAuth } from "@/lib/api";
import { mockTorrents } from "@/lib/dev/preview";
import { listTorrents } from "@/lib/qbittorrent";

export const GET = withAuth(
  async () => jsonOk({ torrents: await listTorrents() }),
  () => ({ torrents: mockTorrents() })
);
