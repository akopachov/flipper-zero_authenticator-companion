import { readable, type Invalidator, type Readable, type Subscriber, type Unsubscriber } from 'svelte/store';

export enum CommonSnackbarType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export type CommonSnackbarState = {
  visible: boolean;
  text: string | null | undefined;
  type: CommonSnackbarType;
};

class CommonSnackbar implements Readable<CommonSnackbarState> {
  #readable: Readable<CommonSnackbarState>;
  #updateState: (fn: (state: CommonSnackbarState) => void) => void = () => {};

  constructor() {
    this.#readable = readable<CommonSnackbarState>(
      { visible: false, text: '', type: CommonSnackbarType.Info },
      (_, update) => {
        this.#updateState = updateFn => {
          update(state => {
            updateFn(state);
            return state;
          });
        };
        return () => {};
      },
    );
  }

  subscribe(
    run: Subscriber<CommonSnackbarState>,
    invalidate?: Invalidator<CommonSnackbarState> | undefined,
  ): Unsubscriber {
    return this.#readable.subscribe(run, invalidate);
  }

  show(text: string, type: CommonSnackbarType) {
    this.#updateState(state => {
      state.text = text;
      state.visible = true;
      state.type = type;
    });
  }
}

export const GlobalCommonSnackbar = new CommonSnackbar();
