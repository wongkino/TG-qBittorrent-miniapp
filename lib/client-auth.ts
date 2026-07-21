/** Client credential for `/api/qb/*` (Telegram initData or Google ID token). */
export type ClientAuth =
  | { mode: "tma"; initData: string }
  | { mode: "bearer"; token: string };

export function authHeaders(auth: ClientAuth): HeadersInit {
  const authorization =
    auth.mode === "tma" ? `tma ${auth.initData}` : `Bearer ${auth.token}`;
  return {
    Authorization: authorization,
    "Content-Type": "application/json",
  };
}
