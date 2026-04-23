/**
 * Lightweight Telegram alerter — reuses the existing BOT_TOKEN from the
 * telegram_bot/ Vercel project. If the env vars aren't set (local dev), no-ops.
 */
export async function alertTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log("[telegram] env not configured, skipping alert:", text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[telegram] alert failed", err);
  }
}
