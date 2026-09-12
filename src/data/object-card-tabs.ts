export enum ObjectCardTab {
  About = "about",
  Progress = "progress",
  Benefit = "benefit",
}

export const objectCardTabOrder = [
  ObjectCardTab.About,
  ObjectCardTab.Progress,
  ObjectCardTab.Benefit,
] as const;

export const objectCardTabLabels: Record<ObjectCardTab, string> = {
  [ObjectCardTab.About]: "О проекте",
  [ObjectCardTab.Progress]: "Ход стройки",
  [ObjectCardTab.Benefit]: "Польза",
};
