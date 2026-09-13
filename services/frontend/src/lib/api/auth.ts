import { API_BASE_URL } from "@/lib/api/config";
import { API_ROUTES } from "@/lib/api/routes";

const ACCESS_TOKEN_KEY = "admin_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function redirectToAdminLogin(): void {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.location.assign("/admin/login");
  }
}

type LoginResponse = {
  access_token: string;
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.login}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = "Неверный email или пароль";
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (typeof body.message === "string") {
        message = body.message;
      } else if (Array.isArray(body.message) && body.message.length > 0) {
        message = body.message.join(", ");
      }
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  setAccessToken(data.access_token);
  return data;
}

export function logout(): void {
  clearAccessToken();
}
