import {
  authHeaders,
  clearAccessToken,
  redirectToAdminLogin,
} from "@/lib/api/auth";
import { API_BASE_URL } from "@/lib/api/config";
import { API_ROUTES } from "@/lib/api/routes";

export type ApiReport = {
  id: string;
  text: string;
  userId: string;
  objectId: string;
  isReplied: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FetchReportsFilter = {
  isReplied?: boolean;
};

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (typeof body.message === "string") {
      return body.message;
    }
    if (Array.isArray(body.message) && body.message.length > 0) {
      return body.message.join(", ");
    }
  } catch {
    // keep fallback
  }
  return fallback;
}

export async function fetchReports(
  filter?: FetchReportsFilter,
): Promise<ApiReport[]> {
  const url = new URL(`${API_BASE_URL}${API_ROUTES.reports}`);
  if (filter?.isReplied !== undefined) {
    url.searchParams.set("isReplied", String(filter.isReplied));
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      ...authHeaders(),
    },
  });

  if (response.status === 401) {
    clearAccessToken();
    redirectToAdminLogin();
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось загрузить обращения (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiReport[];
}

export async function fetchReport(id: string): Promise<ApiReport> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.reportById(id)}`, {
    cache: "no-store",
    headers: {
      ...authHeaders(),
    },
  });

  if (response.status === 401) {
    clearAccessToken();
    redirectToAdminLogin();
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось загрузить обращение (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiReport;
}

export async function replyToReport(
  id: string,
  text: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.reportReply(id)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 401) {
    clearAccessToken();
    redirectToAdminLogin();
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось отправить ответ (${response.status})`,
      ),
    );
  }
}
