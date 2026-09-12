export const API_ROUTES = {
  objects: "/object",
  objectById: (id: string) => `/object/${encodeURIComponent(id)}`,
} as const;
