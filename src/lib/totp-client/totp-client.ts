import { SerialPortAsync } from './serial-port-async';
import type { PortInfo } from '@serialport/bindings-interface';
import { Sema } from 'async-sema';
import EventEmitter from 'node:events';
import { parseFromString } from './ascii-table-parse';
import escapeStringRegexp from 'escape-string-regexp';
import { tryDelay } from './try-delay';
import delay from 'delay';
import { TokenInfo, TokenInfoBase } from '../../models/token-info';
import { tokenLengthFromNumber } from '../../models/token-length';
import { tokenHashingAlgoFromString } from '../../models/token-hashing-algo';
import { TokenAutomationFeature } from '../../models/token-automation-feature';
import {
  DeviceAppAutomation,
  DeviceAppAutomationKeyboardLayout,
  DeviceAppNotification,
  DeviceAppSettings,
} from '../../models/device-app-settings';
import { TokenType, tokenTypeFromString } from '$models/token-type';

const FlipperVendorId = '0483';
const FlipperProductId = '5740';
const TotpCommand = 'totp';

enum TotpCommandOutput {
  EndOfCommand = '>: ',
  AskForPin = 'Pleases enter PIN on your flipper device',
  CommandCancelled = 'Cancelled by user',
  CommandNotFound = 'command not found',
  AskForSecret = 'Enter token secret and confirm with [ENTER]:',
  TokenHasBeenSuccessfulyAdded = 'has been successfully added',
  TokenHasBeenSuccessfulyUpdated = 'has been successfully updated',
  TokenHasBeenSucecssfullyDeleted = 'has been successfully deleted',
  CurrentTimezoneOffset = 'Current timezone offset is',
  CurrentNotifyMethod = 'Current notification method is',
  CurrentAutomationMethod = 'Current automation method is',
}

export enum TotpClientEvents {
  PinRequested = 'totp-client:pin-requested',
  WaitForApp = 'totp-client:wait-for-app',
  Close = 'totp-client:close',
  Connecting = 'totp-client:connecting',
  Connected = 'totp-client:connected',
  CommandExecuting = 'totp-client:command:executing',
  CommandExecuted = 'totp-client:command:executied',
  ConnectionError = 'totp-client:connection-error',
}

async function getFlipperZeroDevice() {
  const serialDevices = await SerialPortAsync.list();
  return serialDevices.find(p => p.vendorId == FlipperVendorId && p.productId == FlipperProductId) || null;
}

async function waitForFlipperZeroDevice(signal?: AbortSignal) {
  let flipperZeroDevice: PortInfo | null = null;
  while ((flipperZeroDevice = await getFlipperZeroDevice()) == null) {
    await delay(1000, { signal: signal });
  }

  return flipperZeroDevice;
}

type ExecuteCommandOptions = {
  skipFirstLine: boolean;
  trimCommandEndSignature: boolean;
  trimEmptyLines: boolean;
  trimTerminalControlCommands: boolean;
  commandEndSign: string | RegExp;
  signal?: AbortSignal;
};

const ExecuteCommandDefaultOptions: ExecuteCommandOptions = {
  skipFirstLine: true,
  trimCommandEndSignature: true,
  trimEmptyLines: true,
  trimTerminalControlCommands: true,
  commandEndSign: TotpCommandOutput.EndOfCommand,
};

export class TotpAppClient extends EventEmitter {
  #serialPort: SerialPortAsync | null = null;
  #executionSemaphore: Sema;
  #getPortSemaphore: Sema;

  constructor() {
    super();
    this.#executionSemaphore = new Sema(1);
    this.#getPortSemaphore = new Sema(1);
  }

  async #getSerialPort(signal?: AbortSignal): Promise<SerialPortAsync> {
    if (this.#serialPort == null) {
      await this.#getPortSemaphore.acquire();
      try {
        if (this.#serialPort == null) {
          let serialPort: SerialPortAsync | null = null;

          do {
            signal?.throwIfAborted();
            this.emit(TotpClientEvents.Connecting, this);
            const flipperZeroDevice = await waitForFlipperZeroDevice();
            serialPort = new SerialPortAsync({ path: flipperZeroDevice.path, baudRate: 115200, autoOpen: false });
            try {
              await serialPort.openAsync();
            } catch (e) {
              this.emit(TotpClientEvents.ConnectionError, this, e);
              serialPort = null;
              await tryDelay(1000, { signal: signal });
            }
            if (serialPort != null) {
              try {
                await serialPort.readUntil(TotpCommandOutput.EndOfCommand, { timeout: 1000, signal: signal });
              } catch (e) {
                this.emit(TotpClientEvents.ConnectionError, this, e);
                await serialPort.closeAsync();
                serialPort = null;
                await tryDelay(1000, { signal: signal });
              }
            }
          } while (serialPort == null);

          if (signal?.aborted) {
            serialPort?.close();
            signal.throwIfAborted();
          }

          this.#serialPort = serialPort;
          serialPort.once('close', () => {
            this.#serialPort = null;
          });
          this.emit(TotpClientEvents.Connected, this);
        }
      } finally {
        this.#getPortSemaphore.release();
      }
    }

    return this.#serialPort;
  }

  async #_executeCommand(command: string, options: Partial<ExecuteCommandOptions>) {
    const opts: ExecuteCommandOptions = { ...ExecuteCommandDefaultOptions, ...options };
    let commandFound = false;
    let response;
    let commandEndSignForRegex;
    if (opts.commandEndSign instanceof RegExp) {
      commandEndSignForRegex = opts.commandEndSign.source;
    } else {
      commandEndSignForRegex = escapeStringRegexp(opts.commandEndSign);
    }
    const commandEndOutputSignRegex = new RegExp(
      `(${commandEndSignForRegex})|(${escapeStringRegexp(TotpCommandOutput.AskForPin)})|(${escapeStringRegexp(
        TotpCommandOutput.CommandCancelled,
      )})`,
      'gi',
    );
    let waitForAppEventEmitted = false;
    do {
      await (await this.#getSerialPort(opts.signal)).flushAsync();
      await (await this.#getSerialPort(opts.signal)).writeAndDrain(command);
      if (opts.skipFirstLine) {
        await (await this.#getSerialPort(opts.signal)).readUntil('\r\n', { timeout: 1000, signal: opts.signal });
      }

      response = await (
        await this.#getSerialPort(opts.signal)
      ).readUntil(commandEndOutputSignRegex, { timeout: 5000, signal: opts.signal });

      commandFound = !!response && !response.includes(TotpCommandOutput.CommandNotFound);
      if (commandFound) {
        if (response?.includes(TotpCommandOutput.AskForPin)) {
          this.emit(TotpClientEvents.PinRequested, this);
          response = await (
            await this.#getSerialPort(opts.signal)
          ).readUntil(commandEndOutputSignRegex, { signal: opts.signal });
        }
      } else {
        if (!waitForAppEventEmitted) {
          this.emit(TotpClientEvents.WaitForApp, this);
          waitForAppEventEmitted = true;
        }
        await tryDelay(1000, { signal: opts.signal });
      }

      opts.signal?.throwIfAborted();
    } while (!commandFound);

    if (!response || response.includes(TotpCommandOutput.CommandCancelled)) {
      response = null;
    } else {
      if (opts.trimCommandEndSignature) {
        response = response.replace(opts.commandEndSign, '');
      }

      if (opts.trimTerminalControlCommands) {
        // eslint-disable-next-line no-control-regex
        response = response.replace(/(\x1b\[(\d+m|A|2K))|(\x08 \x08)\r?/g, '');
      }

      if (opts.trimEmptyLines) {
        response = response.replace(/(\r\n|\r|\n)\s*\1/g, '').trim();
      }
    }

    return response;
  }

  async #executeCommand(command: string, options: Partial<ExecuteCommandOptions> = {}) {
    this.emit(TotpClientEvents.CommandExecuting, this);
    let result: string | null;
    try {
      await this.#executionSemaphore.acquire();
      result = await this.#_executeCommand(command, options);
    } finally {
      this.#executionSemaphore.release();
      this.emit(TotpClientEvents.CommandExecuted, this);
    }

    return result;
  }

  async waitForApp(signal?: AbortSignal) {
    await this.#executeCommand(`${TotpCommand} ?\r`, { signal: signal });
  }

  async listTokens(signal?: AbortSignal) {
    const response = await this.#executeCommand(`${TotpCommand} ls --tsv\r`, { signal: signal });
    if (!response) return [];
    return parseFromString(response).map(
      m =>
        new TokenInfoBase({
          id: Number(m['#']),
          name: m['Name'],
          type: tokenTypeFromString(m['Type']),
          length: tokenLengthFromNumber(Number(m['Ln'])),
          hashingAlgo: tokenHashingAlgoFromString(m['Algo']),
        }),
    );
  }

  async getTokenDetails(id: number, signal?: AbortSignal) {
    const response = await this.#executeCommand(`${TotpCommand} cat ${id} --tsv\r`, { signal: signal });
    if (!response) {
      throw new Error('Unexpected empty response');
    }

    const csvResponse = parseFromString(response);
    const tokenInfo = new TokenInfo();
    for (const row of csvResponse) {
      const property = row['Property'];
      const value = row['Value'];
      switch (property) {
        case 'Index':
          tokenInfo.id = Number(value);
          break;

        case 'Type':
          tokenInfo.type = tokenTypeFromString(value);
          break;

        case 'Name':
          tokenInfo.name = value;
          break;

        case 'Hashing algorithm':
          tokenInfo.hashingAlgo = tokenHashingAlgoFromString(value);
          break;

        case 'Number of digits':
          tokenInfo.length = tokenLengthFromNumber(Number(value));
          break;

        case 'Token lifetime':
          tokenInfo.duration = parseInt(value, 10);
          break;

        case 'Token counter':
          tokenInfo.counter = Number(value);
          break;

        case '':
        case 'Automation features':
          if (value == 'Type <Enter> key at the end') {
            tokenInfo.automationFeatures.add(TokenAutomationFeature.Enter);
          } else if (value == 'Type <Tab> key at the end') {
            tokenInfo.automationFeatures.add(TokenAutomationFeature.Tab);
          } else if (value == 'Type slower') {
            tokenInfo.automationFeatures.add(TokenAutomationFeature.Slower);
          }
      }
    }

    return tokenInfo;
  }

  async updateToken(tokenInfo: TokenInfo, signal?: AbortSignal) {
    const isNewToken = tokenInfo.id <= 0;
    const tokenSecretUpdateNeeded = isNewToken || tokenInfo.secret;
    const baseCommand = isNewToken ? `add "${tokenInfo.name}"` : `update ${tokenInfo.id} -n "${tokenInfo.name}"`;
    let fullCommand = `${TotpCommand} ${baseCommand} -t ${tokenInfo.type} -a ${tokenInfo.hashingAlgo} -e ${tokenInfo.secretEncoding} -d ${tokenInfo.length}`;
    if (tokenInfo.type === TokenType.TOTP) {
      fullCommand += ` -l ${tokenInfo.duration}`;
    } else if (tokenInfo.type === TokenType.HOTP) {
      fullCommand += ` -i ${tokenInfo.counter}`;
    }

    fullCommand += ` -b none`;
    if (!isNewToken && tokenSecretUpdateNeeded) {
      fullCommand += ' -s';
    }

    if (tokenInfo.automationFeatures.size > 0) {
      fullCommand += ' ' + [...tokenInfo.automationFeatures].map(f => `-b ${f}`).join(' ');
    }

    let response = await this.#executeCommand(`${fullCommand}\r`, {
      signal: signal,
      skipFirstLine: true,
      trimCommandEndSignature: false,
      trimEmptyLines: true,
      trimTerminalControlCommands: true,
      commandEndSign: new RegExp(
        `${TotpCommandOutput.EndOfCommand}|${escapeStringRegexp(TotpCommandOutput.AskForSecret)}`,
        'gi',
      ),
    });

    if (tokenSecretUpdateNeeded) {
      if (response != TotpCommandOutput.AskForSecret) {
        throw new Error(`Unexpected response ${response}`);
      }

      response = await this.#executeCommand(`${tokenInfo.secret}\r`, {
        signal: signal,
        skipFirstLine: false,
        trimEmptyLines: false,
        trimTerminalControlCommands: false,
      });
    }

    if (isNewToken && !response?.includes(TotpCommandOutput.TokenHasBeenSuccessfulyAdded)) {
      throw new Error(`Unsuccessfull response ${response}`);
    } else if (!isNewToken && !response?.includes(TotpCommandOutput.TokenHasBeenSuccessfulyUpdated)) {
      throw new Error(`Unsuccessfull response ${response}`);
    }
  }

  async removeToken(id: number, signal?: AbortSignal) {
    const response = await this.#executeCommand(`${TotpCommand} rm ${id} -f\r`, {
      signal: signal,
    });

    if (!response?.endsWith(TotpCommandOutput.TokenHasBeenSucecssfullyDeleted)) {
      throw new Error(`Unsuccessfull response ${response}`);
    }
  }

  async moveToken(fromId: number, toId: number, signal?: AbortSignal) {
    const response = await this.#executeCommand(`${TotpCommand} mv ${fromId} ${toId}\r`, {
      signal: signal,
    });

    if (!response?.endsWith(TotpCommandOutput.TokenHasBeenSuccessfulyUpdated)) {
      throw new Error(`Unsuccessfull response ${response}`);
    }
  }

  async setDeviceDatetime(date: Date, signal?: AbortSignal) {
    await this.#executeCommand(
      `date ${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDay()}\r`,
      { signal: signal },
    );
  }

  async getAppSettings(signal?: AbortSignal) {
    const settings = new DeviceAppSettings();
    const tzCommandResponse = await this.#executeCommand(`${TotpCommand} tz\r`, { signal: signal });
    let tzParsed = false;
    if (tzCommandResponse) {
      const tzRegex = new RegExp(
        `${escapeStringRegexp(TotpCommandOutput.CurrentTimezoneOffset)}\\s+(-?\\d+(\\.\\d+)?)`,
        'gi',
      );
      const tzExecResult = tzRegex.exec(tzCommandResponse);
      if (tzExecResult && tzExecResult.length > 0) {
        settings.timezoneOffset = Number(tzExecResult[1]);
        tzParsed = true;
      }
    }

    if (!tzParsed) {
      throw new Error(`Unable to get timezone setting from device given response ${tzCommandResponse}`);
    }

    const notifyCommandResponse = await this.#executeCommand(`${TotpCommand} notify\r`, { signal: signal });
    let notifySettingsParsed = false;
    if (notifyCommandResponse) {
      const notifyRegex = new RegExp(
        `${escapeStringRegexp(TotpCommandOutput.CurrentNotifyMethod)}\\s+(.+?)(\\r|\\n|$)`,
        'gi',
      );
      const notifyExecResult = notifyRegex.exec(notifyCommandResponse);
      if (notifyExecResult && notifyExecResult.length > 0) {
        notifySettingsParsed = true;
        if (notifyExecResult[1].includes(`"${DeviceAppNotification.Sound}"`)) {
          settings.notification.add(DeviceAppNotification.Sound);
        }

        if (notifyExecResult[1].includes(`"${DeviceAppNotification.Vibro}"`)) {
          settings.notification.add(DeviceAppNotification.Vibro);
        }
      }
    }

    if (!notifySettingsParsed) {
      throw new Error(`Unable to get notification setting from device given response ${notifyCommandResponse}`);
    }

    const automationCommandResponse = await this.#executeCommand(`${TotpCommand} automation\r`, { signal: signal });
    let automationSettingsParsed = false;
    if (automationCommandResponse) {
      const automationRegex = new RegExp(
        `${escapeStringRegexp(TotpCommandOutput.CurrentAutomationMethod)}\\s+(.+?)(\\r|\\n|$)`,
        'gi',
      );
      const automationExecResult = automationRegex.exec(automationCommandResponse);
      if (automationExecResult && automationExecResult.length > 0) {
        automationSettingsParsed = true;
        const rawAutomationState = automationExecResult[1].toLowerCase();
        if (rawAutomationState.includes(`"${DeviceAppAutomation.USB}"`)) {
          settings.automation.add(DeviceAppAutomation.USB);
        }

        if (rawAutomationState.includes(`"${DeviceAppAutomation.Bluetooth}"`)) {
          settings.automation.add(DeviceAppAutomation.Bluetooth);
        }

        if (rawAutomationState.includes(`(${DeviceAppAutomationKeyboardLayout.QWERTY})`)) {
          settings.automationKeyboardLayout = DeviceAppAutomationKeyboardLayout.QWERTY;
        } else if (rawAutomationState.includes(`(${DeviceAppAutomationKeyboardLayout.AZERTY})`)) {
          settings.automationKeyboardLayout = DeviceAppAutomationKeyboardLayout.AZERTY;
        } else if (rawAutomationState.includes(`(${DeviceAppAutomationKeyboardLayout.QWERTZ})`)) {
          settings.automationKeyboardLayout = DeviceAppAutomationKeyboardLayout.QWERTZ;
        }
      }
    }

    if (!automationSettingsParsed) {
      throw new Error(`Unable to get automation setting from device given response ${automationCommandResponse}`);
    }

    return settings;
  }

  async setAppTimezone(timezoneOffset: number, signal?: AbortSignal) {
    await this.#executeCommand(`${TotpCommand} tz ${timezoneOffset}\r`, { signal: signal });
  }

  async updateAppSettings(settings: DeviceAppSettings, signal?: AbortSignal) {
    this.setAppTimezone(settings.timezoneOffset, signal);
    const notifyArg =
      settings.notification.size > 0 ? [...settings.notification].join(' ') : DeviceAppNotification.None;
    await this.#executeCommand(`${TotpCommand} notify ${notifyArg}\r`, { signal: signal });
    const automationArg = settings.automation.size > 0 ? [...settings.automation].join(' ') : DeviceAppAutomation.None;
    await this.#executeCommand(`${TotpCommand} automation ${automationArg} -k ${settings.automationKeyboardLayout}\r`, {
      signal: signal,
    });
  }

  async close() {
    if (this.#serialPort) {
      await this.#serialPort.closeAsync();
    }

    this.emit(TotpClientEvents.Close, this);
  }
}
