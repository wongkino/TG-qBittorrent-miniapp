import {
  handleApiError,
  jsonError,
  jsonOk,
  previewResponse,
  requireAuth,
} from "@/lib/api";
import { isLocale } from "@/lib/i18n";
import { getUserLocale, setUserLocale } from "@/lib/user-locale";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const locale = await getUserLocale(auth.user.id);
    const preview = previewResponse(auth, { locale });
    if (preview) return preview;
    return jsonOk({ locale });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request);
    const body = (await request.json()) as { locale?: string };
    if (!isLocale(body.locale)) {
      return jsonError("locale is required", 400);
    }
    await setUserLocale(auth.user.id, body.locale);
    const preview = previewResponse(auth, { locale: body.locale, ok: true });
    if (preview) return preview;
    return jsonOk({ locale: body.locale });
  } catch (err) {
    return handleApiError(err);
  }
}
