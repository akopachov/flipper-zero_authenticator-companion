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

export enum DeviceAppAutomationKeyboardLayout {
  QWERTY = 'qwerty',
  AZERTY = 'azerty',
}

export class DeviceAppSettings {
  notification: DeviceAppNotification[] = [];
  automation: DeviceAppAutomation[] = [];
  automationKeyboardLayout: DeviceAppAutomationKeyboardLayout = DeviceAppAutomationKeyboardLayout.QWERTY;
  timezoneOffset: number = 0;
}
