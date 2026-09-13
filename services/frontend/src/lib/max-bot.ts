export const REPORT_OBJECT_ID = "491c374c-7b72-43e0-bcd0-bc6058d09418";

const MAX_BOT_USERNAME = process.env.NEXT_PUBLIC_MAX_BOT_USERNAME ?? "";

export function getMaxBotReportUrl(objectId: string = REPORT_OBJECT_ID): string | null {
  const username = MAX_BOT_USERNAME.trim();
  if (!username) {
    return null;
  }

  return `https://max.ru/${encodeURIComponent(username)}?start=${encodeURIComponent(objectId)}`;
}
