/// <reference types="@yandex/ymaps3-types" />

export {};

declare global {
  interface Window {
    ymaps3?: typeof ymaps3;
  }
}
