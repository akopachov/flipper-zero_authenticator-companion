import { SerialPortAsync } from './serial-port-async';
import type { PortInfo } from '@serialport/bindings-interface';
import EventEmitter from 'node:events';
import { parseFromString } from './ascii-table-parse';
import escapeStringRegexp from 'escape-string-regexp';
import { tryDelay } from './try-delay';
import delay from 'delay';
import { TokenInfo, TokenInfoBase } from '../../models/token-info';
import { tokenLengthFromNumber } from '../../models/token-length';
import { tokenHashingAlgoFromString } from '../../models/token-hashing-algo';

const FlipperVendorId = '0483';
const FlipperProductId = '5740';
const TotpCommand = 'totp';

enum TotpCommandOutput {
  EndOfCommand = '>: ',
  AskForPin = 'Pleases enter PIN on your flipper device',
  CommandCancelled = 'Cancelled by user',
  CommandNotFound = 'command not found',
  AskForSecret = 'Enter token secret and confirm with [ENTER]:',
  AskForYesNoConfirmation = 'Confirm? [y/n]',
  TokenHasBeenSuccessfulyAdded = 'has been successfully added',
  TokenHasBeenSuccessfulyUpdated = 'has been successfully updated',
  TokenHasBeenSucecssfullyDeleted = 'has been successfully deleted',
}

export enum TotpClientEvents {
  PinRequested = 'totp-client:pin-requested',
  WaitForApp = 'totp-client:wait-for-app',
  Close = 'totp-client:close',
  Connecting = 'totp-client:connecting',
  Connected = 'totp-client:connected',
  CommandExecuting = 'totp-client:command:executing',
  CommandExecuted = 'totp-client:command:executied',
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
  signal: AbortSignal | undefined;
};

const ExecuteCommandDefaultOptions: ExecuteCommandOptions = {
  skipFirstLine: true,
  trimCommandEndSignature: true,
  trimEmptyLines: true,
  trimTerminalControlCommands: true,
  commandEndSign: TotpCommandOutput.EndOfCommand,
  signal: undefined,
};

export class TotpAppClient extends EventEmitter {
  #serialPort: SerialPortAsync | null = null;

  constructor() {
    super();
    console.log('Constructor');
  }

  async #getSerialPort(signal?: AbortSignal): Promise<SerialPortAsync> {
    if (this.#serialPort == null) {
      let serialPort: SerialPortAsync | null = null;

      do {
        if (signal?.aborted) break;
        this.emit(TotpClientEvents.Connecting, this);
        const flipperZeroDevice = await waitForFlipperZeroDevice();
        serialPort = new SerialPortAsync({ path: flipperZeroDevice.path, baudRate: 115200, autoOpen: false });
        try {
          await serialPort.openAsync();
        } catch (e) {
          console.warn(e);
          serialPort = null;
          await tryDelay(1000, { signal: signal });
        }
        if (serialPort != null) {
          try {
            await serialPort.readUntil(TotpCommandOutput.EndOfCommand, { timeout: 1000, signal: signal });
          } catch (e) {
            console.warn(e);
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

      if (serialPort) {
        serialPort.on('close', () => {
          this.#serialPort = null;
        });
        this.emit(TotpClientEvents.Connected, this);
      }

      this.#serialPort = serialPort;
    }

    if (!this.#serialPort) throw 'Shutup TypeScript! This will never happen';

    return this.#serialPort;
  }

  async #_executeCommand(command: string, options: Partial<ExecuteCommandOptions> = {}) {
    const opts: ExecuteCommandOptions = Object.assign({}, ExecuteCommandDefaultOptions, options);
    let commandFound = false;
    let response;
    let commandEndSignForRegex;
    if (opts.commandEndSign instanceof RegExp) {
      commandEndSignForRegex = opts.commandEndSign.source;
    } else {
      commandEndSignForRegex = escapeStringRegexp(opts.commandEndSign);
    }

    await (await this.#getSerialPort(opts.signal)).drainAsync();
    const commandEndOutputSignRegex = new RegExp(
      `(${commandEndSignForRegex})|(${escapeStringRegexp(TotpCommandOutput.AskForPin)})|(${escapeStringRegexp(
        TotpCommandOutput.CommandCancelled,
      )})`,
      'gi',
    );
    let waitForAppEventEmitted = false;
    do {
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
      result = await this.#_executeCommand(command, options);
    } finally {
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
          duration: Number(m['Dur']),
          length: tokenLengthFromNumber(Number(m['Ln'])),
          hashingAlgo: tokenHashingAlgoFromString(m['Algo']),
        }),
    );
  }

  async updateToken(tokenInfo: TokenInfo, signal?: AbortSignal) {
    const isNewToken = tokenInfo.id <= 0;
    const tokenSecretUpdateNeeded = isNewToken || tokenInfo.secret;
    const baseCommand = isNewToken ? 'add' : `update ${tokenInfo.id}`;
    let fullCommand = `${TotpCommand} ${baseCommand} "${tokenInfo.name}" -a ${tokenInfo.hashingAlgo} -e ${tokenInfo.secretEncoding} -d ${tokenInfo.length} -l ${tokenInfo.duration}`;
    if (!isNewToken && tokenSecretUpdateNeeded) {
      fullCommand += ' -s';
    }

    if (tokenInfo.automationFeatures.length > 0) {
      fullCommand += ' ' + tokenInfo.automationFeatures.map(f => `-b ${f}`).join(' ');
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
        throw `Unexpected response ${response}`;
      }

      response = await this.#executeCommand(`${tokenInfo.secret}\r`, {
        signal: signal,
        skipFirstLine: false,
        trimEmptyLines: false,
        trimTerminalControlCommands: false,
      });
    }

    if (isNewToken && !response?.includes(TotpCommandOutput.TokenHasBeenSuccessfulyAdded)) {
      throw `Unsuccessfull response ${response}`;
    } else if (!isNewToken && !response?.includes(TotpCommandOutput.TokenHasBeenSuccessfulyUpdated)) {
      throw `Unsuccessfull response ${response}`;
    }
  }

  async removeToken(id: number, signal?: AbortSignal) {
    let response = await this.#executeCommand(`${TotpCommand} rm ${id}\r`, {
      signal: signal,
      skipFirstLine: true,
      trimCommandEndSignature: false,
      trimEmptyLines: false,
      trimTerminalControlCommands: false,
      commandEndSign: new RegExp(
        `${TotpCommandOutput.EndOfCommand}|${escapeStringRegexp(TotpCommandOutput.AskForYesNoConfirmation)}`,
        'gi',
      ),
    });

    if (!response?.endsWith(TotpCommandOutput.AskForYesNoConfirmation)) {
      throw `Unexpected response ${response}`;
    }

    response = await this.#executeCommand('y', {
      signal: signal,
      skipFirstLine: false,
      trimCommandEndSignature: true,
    });

    if (!response?.endsWith(TotpCommandOutput.TokenHasBeenSucecssfullyDeleted)) {
      throw `Unsuccessfull response ${response}`;
    }
  }

  async close() {
    if (this.#serialPort) {
      await this.#serialPort.closeAsync();
    }

    this.emit(TotpClientEvents.Close, this);
  }
}
