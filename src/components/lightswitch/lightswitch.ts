import { ThemeColorSchemePreference } from '$models/app-settings';
import { GlobalAppSettings } from '$stores/global-app-settings';
import { get, writable } from 'svelte/store';

export const modeUserPrefers = writable<ThemeColorSchemePreference>(GlobalAppSettings.theme.colorScheme);

export function getModeOsPrefers(): ThemeColorSchemePreference {
  const prefersLightMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersLightMode ? ThemeColorSchemePreference.Dark : ThemeColorSchemePreference.Light;
}

export function getModeUserPrefers(): ThemeColorSchemePreference {
  return get(modeUserPrefers);
}

export function getModeAutoPrefers(): ThemeColorSchemePreference {
  const user = getModeUserPrefers();
  if (user !== ThemeColorSchemePreference.System) {
    return user;
  }

  return getModeOsPrefers();
}

export function setInitialClassState(userMode: ThemeColorSchemePreference) {
  const elemHtmlClasses = document.documentElement.classList;
  const condMatchMedia = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if ((userMode === 'os' && condMatchMedia) || userMode === 'dark') {
    elemHtmlClasses.add('dark');
  } else {
    elemHtmlClasses.remove('dark');
  }
}

export function updateMode() {
  const elemHtmlClasses = document.documentElement.classList;
  const classDark = `dark`;
  if (getModeAutoPrefers() === ThemeColorSchemePreference.Dark) {
    elemHtmlClasses.add(classDark);
  } else {
    elemHtmlClasses.remove(classDark);
  }
}

export function autoModeWatcher(): void {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.onchange = () => {
    updateMode();
  };
  modeUserPrefers.subscribe(() => {
    updateMode();
  });
  updateMode();
}
