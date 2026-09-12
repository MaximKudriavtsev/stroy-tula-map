export type SplashAnimation = {
  id: string;
  tag: string;
  file: string;
};

export const splashAnimations: SplashAnimation[] = [
  {
    id: "tula-school",
    tag: "tula-school-37",
    file: "tula-school",
  },
  {
    id: "tula-tulitsa",
    tag: "tula-tulitsa",
    file: "tula-tulitsa",
  },
];

export function pickRandomSplashAnimation(): SplashAnimation | null {
  if (splashAnimations.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * splashAnimations.length);
  return splashAnimations[index];
}

export function loadSplashAnimation(
  animation: SplashAnimation,
): Promise<unknown> {
  return import(`./${animation.file}.js`);
}
