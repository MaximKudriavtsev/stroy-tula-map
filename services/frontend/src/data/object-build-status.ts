export enum ObjectBuildStatus {
  Planned = "planned",
  InProgress = "inProgress",
  OpeningSoon = "openingSoon",
  Completed = "completed",
}

export const objectBuildStatusLabels: Record<ObjectBuildStatus, string> = {
  [ObjectBuildStatus.Planned]: "Планируется",
  [ObjectBuildStatus.InProgress]: "В работе",
  [ObjectBuildStatus.OpeningSoon]: "Скоро открытие",
  [ObjectBuildStatus.Completed]: "Завершено",
};
