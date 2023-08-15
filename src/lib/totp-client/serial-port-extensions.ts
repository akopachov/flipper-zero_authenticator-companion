import delay from 'delay';
import { writeAsync, drainAsync } from './serial-port-async';
import { SmartBuffer } from 'smart-buffer';
import type { SerialPort } from 'serialport';

export async function readUntil(port: SerialPort, end: string | RegExp, timeout: number = 0) {
  let timeoutAbortController = null;
  let timeoutExpired = false;
  if (timeout && timeout > 0) {
    timeoutAbortController = new AbortController();
    delay(timeout, { signal: timeoutAbortController.signal }).then(() => {
      timeoutExpired = true;
    }, () => {});
  }

  const buffer = new SmartBuffer();
  let matchFound = false;
  let result = null;
  do {
    const readResult = port.read(1);
    if (!readResult) {
      await delay(100, { signal: timeoutAbortController ? timeoutAbortController.signal : undefined });
      continue;
    }

    buffer.writeBuffer(readResult);
    result = buffer.toString('ascii');
    if (end instanceof RegExp) {
      matchFound = end.test(result);
    } else {
      matchFound = result.includes(end);
    }
  } while (!matchFound && !timeoutExpired);

  if (timeoutAbortController) {
    timeoutAbortController.abort();
  }

  buffer.destroy();

  if (timeoutExpired) {
    throw 'Timeout expired';
  }

  return result;
}

export async function writeAndDrain (port: SerialPort, data: string | Buffer, encoding: BufferEncoding = 'ascii') {
  await writeAsync(port, data, encoding);
  await drainAsync(port);
}
