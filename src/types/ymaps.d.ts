/// <reference types="yandex-maps" />

export {};

declare global {
  interface Window {
    ymaps?: typeof ymaps;
  }
}
