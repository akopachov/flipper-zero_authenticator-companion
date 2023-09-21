import type { Action } from 'svelte/action';

const DarkThemeClass = 'dark';

function setThemeClass(node: HTMLElement, preferDark: boolean) {
  if (preferDark) {
    node.classList.add(DarkThemeClass);
  } else {
    node.classList.remove(DarkThemeClass);
  }
}

export const theme: Action<Document | HTMLElement> = node => {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let targetEl: HTMLElement;
  if (node instanceof Document) {
    targetEl = node.documentElement;
  } else if (node instanceof HTMLElement) {
    targetEl = node;
  } else {
    throw Error('Unsupported node type');
  }

  mql.onchange = e => setThemeClass(targetEl, e.matches);
  setThemeClass(targetEl, mql.matches);

  return {
    destroy: () => {
      targetEl.classList.remove(DarkThemeClass);
    },
  };
};
