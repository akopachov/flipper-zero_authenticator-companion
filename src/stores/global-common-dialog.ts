import { readable, type Invalidator, type Readable, type Subscriber, type Unsubscriber } from 'svelte/store';

export type CommonDialogButton = { text: string; action: string };
export type CommonDialogState = {
  visible: boolean;
  title: string | null | undefined;
  content: string | null | undefined;
  buttons: CommonDialogButton[];
};

class CommonDialog implements Readable<CommonDialogState> {
  #readable: Readable<CommonDialogState>;
  #updateState: (fn: (state: CommonDialogState) => void) => void = () => {};
  #resolveHandler: (action: string) => void = () => {};

  constructor() {
    this.#readable = readable<CommonDialogState>(
      { visible: false, title: '', content: '', buttons: [] },
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

  subscribe(run: Subscriber<CommonDialogState>, invalidate?: Invalidator<CommonDialogState> | undefined): Unsubscriber {
    return this.#readable.subscribe(run, invalidate);
  }

  show(title: string, content: string, buttons: CommonDialogButton[]) {
    this.#updateState(state => {
      state.title = title;
      state.content = content;
      state.buttons = buttons;
      state.visible = true;
    });
    return new Promise(resolve => {
      this.#resolveHandler = resolve;
    });
  }

  _handleDialogResult(action: string) {
    this.#resolveHandler(action);
  }
}

export const GlobalCommonDialog = new CommonDialog();
