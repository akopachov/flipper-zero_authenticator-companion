import { toastStore } from '@skeletonlabs/skeleton';

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

export class GlobalCommonToast {
  static show(text: string, type: CommonToastType) {
    toastStore.trigger({
      message: text,
      background: BackgroundClasses[type],
      autohide: false,
    });
  }
}
