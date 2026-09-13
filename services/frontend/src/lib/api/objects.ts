import {
  authHeaders,
  clearAccessToken,
  redirectToAdminLogin,
} from "@/lib/api/auth";
import { API_BASE_URL } from "@/lib/api/config";
import { API_ROUTES } from "@/lib/api/routes";
import type { ApiObject } from "@/lib/api/types";
import type { CreateObjectInput } from "@/lib/create-object";

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

async function handleUnauthorized(response: Response): Promise<void> {
  if (response.status === 401) {
    clearAccessToken();
    redirectToAdminLogin();
  }
}

export async function fetchObjects(): Promise<ApiObject[]> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.objects}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось загрузить объекты (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiObject[];
}

export async function fetchObject(id: string): Promise<ApiObject> {
  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.objectById(id)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось загрузить объект (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiObject;
}

export async function createObject(
  payload: CreateObjectInput,
): Promise<ApiObject> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.objects}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await handleUnauthorized(response);
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось создать объект (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiObject;
}

export async function updateObject(
  id: string,
  payload: CreateObjectInput,
): Promise<ApiObject> {
  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.objectById(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    await handleUnauthorized(response);
    throw new Error(
      await readErrorMessage(
        response,
        `Не удалось обновить объект (${response.status})`,
      ),
    );
  }

  return (await response.json()) as ApiObject;
}
