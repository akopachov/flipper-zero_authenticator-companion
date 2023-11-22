import { getToastStore, type ToastStore } from '@skeletonlabs/skeleton';

export enum CommonToastType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

const BackgroundClasses = {
  [CommonToastType.Info]: 'variant-filled-primary',
  [CommonToastType.Success]: 'variant-filled-success',
  [CommonToastType.Warning]: 'variant-filled-warning',
  [CommonToastType.Error]: 'variant-filled-error',
};

let toastStore: ToastStore;

type GlobalCommonToastShowOptions = {
  errorObj?: unknown;
  autohideTimeout?: number;
};

export class GlobalCommonToast {
  static initialize() {
    toastStore = getToastStore();
  }
  static show(text: string, type: CommonToastType, options?: GlobalCommonToastShowOptions) {
    let toastMessage = text;
    if (options?.errorObj) {
      let errorText = options.errorObj;
      if (options.errorObj instanceof Error) {
        errorText = options.errorObj.message;
      }

      toastMessage = `<p class="block">${text}</p><p class="text-sm block mt-2">Error details:</p><pre class="pre text-xs mt-2 bg-opacity-30 bg-neutral-950">${errorText}</pre>`;
    }

    toastStore.trigger({
      message: toastMessage,
      background: BackgroundClasses[type],
      autohide: options?.autohideTimeout !== undefined,
      timeout: options?.autohideTimeout,
    });
  }
}
