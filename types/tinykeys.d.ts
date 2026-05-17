declare module "tinykeys" {
  type KeyBindingMap = Record<string, (event: KeyboardEvent) => void>;
  interface KeyBindingOptions {
    timeout?: number;
    event?: string;
    capture?: boolean;
  }
  export function tinykeys(
    target: Window | HTMLElement,
    keyBindingMap: KeyBindingMap,
    options?: KeyBindingOptions,
  ): () => void;
  export function createKeybindingsHandler(
    keyBindingMap: KeyBindingMap,
    options?: KeyBindingOptions,
  ): (event: KeyboardEvent) => void;
}
