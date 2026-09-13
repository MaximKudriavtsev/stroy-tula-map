export const API_ROUTES = {
  objects: "/object",
  objectById: (id: string) => `/object/${encodeURIComponent(id)}`,
  login: "/auth/login",
  reports: "/report",
  reportById: (id: string) => `/report/${encodeURIComponent(id)}`,
  reportReply: (id: string) => `/report/${encodeURIComponent(id)}/reply`,
} as const;
