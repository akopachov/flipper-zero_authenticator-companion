export enum DeviceAppNotification {
  None = 'none',
  Vibro = 'vibro',
  Sound = 'sound',
}

export enum DeviceAppAutomation {
  None = 'none',
  USB = 'usb',
  Bluetooth = 'bt',
}

export class DeviceAppSettings {
  notification: DeviceAppNotification[] = [];
  automation: DeviceAppAutomation[] = [];
  timezoneOffset: number = 0;
}
