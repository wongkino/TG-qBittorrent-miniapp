export type Torrent = {
  hash: string;
  name: string;
  size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  state: string;
  eta: number;
};

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
      x.eta !== y.eta
    ) {
      return false;
    }
  }
  return true;
}
