import { Singleton } from '$lib/singleton';
import { readable, type Invalidator, type Readable, type Subscriber, type Unsubscriber } from 'svelte/store';

export type PreloaderState = { visible: boolean; description: string | null | undefined };

class Preloader implements Readable<PreloaderState> {
  #readable: Readable<PreloaderState>;
  #updateState: (fn: (state: PreloaderState) => void) => void = () => {};
  #pending: number = 0;

  constructor() {
    this.#readable = readable<PreloaderState>({ visible: false, description: '' }, (_, update) => {
      this.#updateState = updateFn => {
        update(state => {
          updateFn(state);
          return state;
        });
      };
      return () => {};
    });
  }

  subscribe(run: Subscriber<PreloaderState>, invalidate?: Invalidator<PreloaderState> | undefined): Unsubscriber {
    return this.#readable.subscribe(run, invalidate);
  }

  show(description?: string) {
    this.#pending++;
    this.#updateState(state => {
      state.description = description || '';
      state.visible = this.#pending > 0;
    });
  }

  setDescription(description: string) {
    this.#updateState(state => (state.description = description));
  }

  clearDescription() {
    this.setDescription('');
  }

  hide() {
    this.#pending--;
    this.#updateState(state => {
      state.visible = this.#pending > 0;
    });
  }
}

export const GlobalPreloader = Singleton.instance('GlobalPreloader', () => new Preloader());
