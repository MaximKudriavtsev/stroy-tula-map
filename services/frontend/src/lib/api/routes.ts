export const API_ROUTES = {
  objects: "/object",
  objectById: (id: string) => `/object/${encodeURIComponent(id)}`,
  login: "/auth/login",
  reports: "/report",
} as const;
