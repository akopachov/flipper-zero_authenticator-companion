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
  QWERTZ = 'qwertz',
}

export class AutomationSet extends Set<DeviceAppAutomation> {
  get usb() {
    return this.has(DeviceAppAutomation.USB);
  }
  set usb(v: boolean) {
    if (v) {
      this.add(DeviceAppAutomation.USB);
    } else {
      this.delete(DeviceAppAutomation.USB);
    }
  }

  get bluetooth() {
    return this.has(DeviceAppAutomation.Bluetooth);
  }
  set bluetooth(v: boolean) {
    if (v) {
      this.add(DeviceAppAutomation.Bluetooth);
    } else {
      this.delete(DeviceAppAutomation.Bluetooth);
    }
  }
}

export class NotificationSet extends Set<DeviceAppNotification> {
  get sound() {
    return this.has(DeviceAppNotification.Sound);
  }
  set sound(v: boolean) {
    if (v) {
      this.add(DeviceAppNotification.Sound);
    } else {
      this.delete(DeviceAppNotification.Sound);
    }
  }

  get vibro() {
    return this.has(DeviceAppNotification.Vibro);
  }
  set vibro(v: boolean) {
    if (v) {
      this.add(DeviceAppNotification.Vibro);
    } else {
      this.delete(DeviceAppNotification.Vibro);
    }
  }
}

export class DeviceAppSettings {
  notification: NotificationSet = new NotificationSet();
  automation: AutomationSet = new AutomationSet();
  automationKeyboardLayout: DeviceAppAutomationKeyboardLayout = DeviceAppAutomationKeyboardLayout.QWERTY;
  timezoneOffset: number = 0;
}
