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

export class GlobalCommonToast {
  static initialize() {
    toastStore = getToastStore();
  }
  static show(text: string, type: CommonToastType, errorObj?: unknown) {
    let toastMessage = text;
    if (errorObj) {
      let errorText = errorObj;
      if (errorObj instanceof Error) {
        errorText = errorObj.message;
      }

      toastMessage = `<p class="block">${text}</p><p class="text-sm block mt-2">Error details:</p><pre class="pre text-xs mt-2 bg-opacity-30 bg-neutral-950">${errorText}</pre>`;
    }

    toastStore.trigger({
      message: toastMessage,
      background: BackgroundClasses[type],
      autohide: false,
    });
  }
}
