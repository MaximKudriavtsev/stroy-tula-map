export const REPORT_OBJECT_ID = "573510b8-d351-4fda-b102-7fa9689ea170";

const MAX_BOT_USERNAME = process.env.NEXT_PUBLIC_MAX_BOT_USERNAME ?? "";

export function getMaxBotReportUrl(objectId: string = REPORT_OBJECT_ID): string | null {
  const username = MAX_BOT_USERNAME.trim();
  if (!username) {
    return null;
  }

  return `https://max.ru/${encodeURIComponent(username)}?start=${encodeURIComponent(objectId)}`;
}
