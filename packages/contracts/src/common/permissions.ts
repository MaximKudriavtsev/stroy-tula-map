export const PERMISSION_ACTIONS = [
  'objects.read',
  'objects.write',
  'objects.publish',
  'objects.archive',
  'imports.write',
  'appeals.read',
  'appeals.reply',
  'appeals.link',
  'tasks.read',
  'tasks.update',
  'tasks.transition',
  'tasks.merge',
  'assets.read',
  'assets.write',
  'analysis.review',
  'integrations.read',
  'integrations.retry',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const isPermissionAction = (value: string): value is PermissionAction =>
  (PERMISSION_ACTIONS as readonly string[]).includes(value);

export type AccessResource = {
  municipalityId: string | null;
  assigneeId?: string | null;
};

export type AccessPolicy = {
  assert: (actor: { id: string; roles: string[] }, action: string, resource: AccessResource) => void;
};
