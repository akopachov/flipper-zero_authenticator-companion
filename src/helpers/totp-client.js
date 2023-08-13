import { TotpCommand, FlipperCliEndOfCommand, FlipperVendorId, FlipperProductId } from './constants';
import delay from "delay";
import { SerialPort } from 'serialport';
import { readUntil, writeAndDrain } from './serial-port-extensions';
import { openAsync, closeAsync } from './serial-port-async';
import EventEmitter from 'node:events';
import { parseString } from './ascii-table-parse';

async function getFlipperZeroDevice() {
  const serialDevices = await SerialPort.list();
  return serialDevices.find(p => p.vendorId == FlipperVendorId && p.productId == FlipperProductId);
}

async function waitForFlipperZeroDevice() {
  let flipperZeroDevice = null;
  while ((flipperZeroDevice = await getFlipperZeroDevice()) == null) {
    await delay(1000);
  }

  return flipperZeroDevice;
}

export class TotpAppClient extends EventEmitter {
  #serialPort = null;

  constructor(serialPort) {
    super();
    this.#serialPort = serialPort;
    this.#serialPort.on('close', e => this.emit('close', e));
  }

  static async createForFirstFoundDevice() {
    let serialPort = null;
    do {
      let flipperZeroDevice = await waitForFlipperZeroDevice();
      serialPort = new SerialPort({ path: flipperZeroDevice.path, baudRate: 230400, autoOpen: false });
      try {
        await openAsync(serialPort);
      } catch (e) {
        console.warn(e);
        serialPort = null;
        await delay(1000);
      }
      if (serialPort != null) {
        try {
          await readUntil(serialPort, FlipperCliEndOfCommand, 1000);
        } catch {
          console.warn(e);
          await closeAsync(serialPort);
          serialPort = null;
          await delay(1000);
        }
      }
    } while (serialPort == null);

    return new TotpAppClient(serialPort);
  }

  async waitForApp() {
    let ready = false;
    do {
      await writeAndDrain(this.#serialPort, `${TotpCommand} ?\r`);
      const response = await readUntil(this.#serialPort, FlipperCliEndOfCommand, 1000);
      ready = !response.includes('command not found');
      console.log(response);
      if (!ready) {
        await delay(1000);
      }
    } while (!ready)
  }

  async listTokens() {
    let done = false;
    let response;
    do {
      await writeAndDrain(this.#serialPort, `${TotpCommand} ls\r`);
      await readUntil(this.#serialPort, '\r\n', 1000);
      response = await readUntil(this.#serialPort, FlipperCliEndOfCommand, 1000);
      done = !response.includes('command not found');
      console.log(response);
      if (!done) {
        await delay(1000);
      }
    } while (!done);

    return parseString(response, { header: true, multiline: false });
  }

  async close() {
    if (this.#serialPort) {
      await closeAsync(this.#serialPort);
    }
  }
}
