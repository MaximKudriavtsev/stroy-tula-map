export type UUID = string;

export type MapViewport = {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
};

export type MapRuntime = {
  project: (point: [number, number]) => { x: number; y: number; visible: boolean };
  flyToObject: (id: UUID, options?: { rememberView?: boolean }) => Promise<void>;
  restoreView: () => Promise<void>;
  getViewport: () => MapViewport;
  getVisibleObjectIds: () => UUID[];
  subscribe: (event: 'moveend' | 'selection' | 'destroy', fn: () => void) => () => void;
  addExtension: (extension: MapExtension) => () => void;
};

export type MapExtension = {
  id: string;
  mount: (context: { map: unknown; runtime: MapRuntime }) => () => void;
};

export type GenericModelFactory<TGroup = unknown> = {
  create: (input: {
    type: string;
    stage: string;
    quality: 'LOW' | 'NORMAL';
  }) => TGroup;
  dispose: (group: TGroup) => void;
};
