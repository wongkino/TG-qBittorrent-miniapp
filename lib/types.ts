export type Torrent = {
  hash: string;
  name: string;
  size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  state: string;
  eta: number;
  category: string;
  added_on: number;
};

export type SortKey =
  | "added_on"
  | "name"
  | "progress"
  | "dlspeed"
  | "upspeed"
  | "size"
  | "eta";

export type SortDir = "asc" | "desc";

export function torrentsEqual(a: Torrent[], b: Torrent[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (
      x.hash !== y.hash ||
      x.name !== y.name ||
      x.size !== y.size ||
      x.progress !== y.progress ||
      x.dlspeed !== y.dlspeed ||
      x.upspeed !== y.upspeed ||
      x.state !== y.state ||
      x.eta !== y.eta ||
      x.category !== y.category ||
      x.added_on !== y.added_on
    ) {
      return false;
    }
  }
  return true;
}

export function sortTorrents(
  torrents: Torrent[],
  key: SortKey,
  dir: SortDir
): Torrent[] {
  const sorted = [...torrents];
  const sign = dir === "asc" ? 1 : -1;
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name, "zh-Hant");
        break;
      case "progress":
        cmp = a.progress - b.progress;
        break;
      case "dlspeed":
        cmp = a.dlspeed - b.dlspeed;
        break;
      case "upspeed":
        cmp = a.upspeed - b.upspeed;
        break;
      case "size":
        cmp = a.size - b.size;
        break;
      case "eta":
        cmp = a.eta - b.eta;
        break;
      case "added_on":
      default:
        cmp = a.added_on - b.added_on;
        break;
    }
    if (cmp === 0) cmp = a.name.localeCompare(b.name, "zh-Hant");
    return cmp * sign;
  });
  return sorted;
}
