/**
 * Telegram Bot API helper for admin notifications.
 *
 * Sends messages via the Telegram Bot HTTP API.
 * Supports multiple admin chat IDs (comma-separated env var).
 * All methods are fire-and-forget safe — never throw to callers.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_IDS_RAW = process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "";

function getAdminChatIds(): string[] {
  return CHAT_IDS_RAW.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isConfigured(): boolean {
  return Boolean(BOT_TOKEN && getAdminChatIds().length > 0);
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

export interface TelegramSendResult {
  ok: boolean;
  chatId: string;
  statusCode?: number;
  error?: string;
}

/**
 * Send a text message to a single Telegram chat.
 */
async function sendMessage(
  chatId: string,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
): Promise<TelegramSendResult> {
  if (!BOT_TOKEN) {
    return { ok: false, chatId, error: "Telegram bot token not configured" };
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    if (res.ok) {
      return { ok: true, chatId, statusCode: res.status };
    }

    const body = await res.text().catch(() => "");
    return { ok: false, chatId, statusCode: res.status, error: body.slice(0, 500) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, chatId, error: msg.slice(0, 500) };
  }
}

/**
 * Send a message to all configured admin chat IDs.
 * Returns one result per recipient.
 */
export async function sendToAdmins(
  text: string,
): Promise<TelegramSendResult[]> {
  if (!isConfigured()) {
    return [{ ok: false, chatId: "", error: "Telegram not configured" }];
  }

  const chatIds = getAdminChatIds();
  return Promise.all(chatIds.map((id) => sendMessage(id, text)));
}

/**
 * Check whether Telegram notifications are configured.
 */
export { isConfigured as isTelegramConfigured };
