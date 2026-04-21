import { NextResponse } from "next/server";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tools/telegram-test
 * Diagnoses Telegram configuration and sends a test message.
 * Returns a JSON report with env var presence, config status, and send result.
 */
export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatIdsRaw = process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "";

  const chatIds = chatIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const report: Record<string, unknown> = {
    env: {
      TELEGRAM_BOT_TOKEN: botToken ? `set (${botToken.length} chars, ends …${botToken.slice(-6)})` : "MISSING",
      TELEGRAM_ADMIN_CHAT_IDS: chatIdsRaw ? `set → [${chatIds.join(", ")}]` : "MISSING",
    },
    configured: Boolean(botToken && chatIds.length > 0),
    sendResults: [] as unknown[],
  };

  if (!report.configured) {
    return NextResponse.json(report, { status: 200 });
  }

  const testMessage = `🔔 <b>Telegram Test</b>\n\nZenturo Travel admin Telegram bağlantısı çalışıyor.\nSunucu zamanı: ${new Date().toISOString()}`;

  const sendResults = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: testMessage,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });

        if (res.ok) {
          return { chatId, ok: true, status: res.status };
        }

        const body = await res.text().catch(() => "");
        return { chatId, ok: false, status: res.status, error: body.slice(0, 300) };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { chatId, ok: false, error: msg };
      }
    }),
  );

  report.sendResults = sendResults;
  const allOk = sendResults.every((r: any) => r.ok);
  return NextResponse.json(report, { status: allOk ? 200 : 500 });
}
