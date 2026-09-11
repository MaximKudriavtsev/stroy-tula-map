import { authEndpoints } from './auth.js';
import { extrasBotOpsEndpoints } from './extras.js';
import { importMediaTimelineMetricEndpoints } from './imports-media-timeline.js';
import { objectEndpoints } from './objects.js';
import type { CatalogEndpoint } from './types.js';
import { workflowEndpoints } from './workflow.js';

export const catalogEndpoints: CatalogEndpoint[] = [
  ...authEndpoints,
  ...objectEndpoints,
  ...importMediaTimelineMetricEndpoints,
  ...workflowEndpoints,
  ...extrasBotOpsEndpoints,
];

export const findEndpoint = (method: string, path: string): CatalogEndpoint | undefined =>
  catalogEndpoints.find((endpoint) => endpoint.method === method && endpoint.path === path);

export const matchEndpoint = (
  method: string,
  pathname: string,
): { endpoint: CatalogEndpoint; params: Record<string, string> } | undefined => {
  const normalizedMethod = method.toUpperCase();
  for (const endpoint of catalogEndpoints) {
    if (endpoint.method !== normalizedMethod) {
      continue;
    }
    const paramNames = [...endpoint.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1] ?? '');
    const pattern = endpoint.path.replace(/\{[^}]+\}/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    if (!match) {
      continue;
    }
    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      const value = match[index + 1];
      if (name && value) {
        params[name] = value;
      }
    });
    return { endpoint, params };
  }
  return undefined;
};
