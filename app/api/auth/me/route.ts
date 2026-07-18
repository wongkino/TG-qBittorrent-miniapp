import { handleApiError, jsonOk, requireAuth } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { user } = requireAuth(request);
    return jsonOk({
      ok: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
