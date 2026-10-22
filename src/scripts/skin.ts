/**
 * Dark / light mode: a data attribute on <html>. Until the visitor picks one it follows the system setting, live;
 * once they pick, the choice is saved. The boot script in BaseLayout applies it before first paint.
 */
import type { Skin } from './lib/commands';

const STORAGE_KEY = 'skin';

export function savedSkin(): Skin | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  } catch {
    return null;
  }
}

export function currentSkin(): Skin {
  return document.documentElement.dataset.skin === 'light' ? 'light' : 'dark';
}

function applySkin(skin: Skin): void {
  document.documentElement.dataset.skin = skin;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-skin-set]')) {
    button.setAttribute('aria-pressed', String(button.dataset.skinSet === skin));
  }
  document.dispatchEvent(new CustomEvent<Skin>('skinchange', { detail: skin }));
}

/** The visitor's explicit choice: applied and remembered. */
export function setSkin(skin: Skin): void {
  applySkin(skin);
  try {
    localStorage.setItem(STORAGE_KEY, skin);
  } catch {
    // Private mode or blocked storage: the mode still applies for this page.
  }
}

export function initSkinToggle(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-skin-set]')) {
    button.addEventListener('click', () => setSkin(button.dataset.skinSet === 'light' ? 'light' : 'dark'));
    button.setAttribute('aria-pressed', String(button.dataset.skinSet === currentSkin()));
  }
  // Follow the system setting until the visitor makes a choice of their own.
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!savedSkin()) applySkin(e.matches ? 'light' : 'dark');
  });
}
