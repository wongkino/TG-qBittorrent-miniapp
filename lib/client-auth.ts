/** Google ID token or local `dev-preview` bearer for `/api/qb/*`. */
export type ClientAuth = {
  token: string;
};

export function authHeaders(auth: ClientAuth): HeadersInit {
  return {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  };
}
