import { SerialPort } from 'serialport';
import delay from 'delay';
import { SmartBuffer } from 'smart-buffer';
import { tryDelay } from './try-delay';

export interface ReadUntilOptions {
  timeout: number;
  signal: AbortSignal;
}

export class SerialPortAsync extends SerialPort {
  flushAsync() {
    return new Promise<void>((resolve, reject) => {
      this.flush(error => {
        if (error == null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  openAsync() {
    return new Promise<void>((resolve, reject) => {
      this.open(error => {
        if (error == null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  closeAsync() {
    return new Promise<void>((resolve, reject) => {
      this.close(error => {
        if (error == null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  writeAsync(data: string | Buffer, encoding: BufferEncoding) {
    return new Promise<void>((resolve, reject) => {
      this.write(data, encoding, error => {
        if (error == null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  drainAsync() {
    return new Promise<void>((resolve, reject) => {
      this.drain(error => {
        if (error == null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  async readUntil(end: string | RegExp, options?: Partial<ReadUntilOptions>) {
    let timeoutAbortController: AbortController | null = null;
    let timeoutExpired = false;
    options = options || {};
    if (options.timeout && options.timeout > 0) {
      timeoutAbortController = new AbortController();
      delay(options.timeout, { signal: timeoutAbortController.signal }).then(
        () => {
          timeoutExpired = true;
        },
        () => {},
      );
    }

    const buffer = new SmartBuffer();
    let matchFound = false;
    let result: string | null = null;
    do {
      if (options.signal?.aborted) {
        break;
      }

      const readResult = this.read(1);
      if (!readResult) {
        await tryDelay(100, { signal: timeoutAbortController ? timeoutAbortController.signal : undefined });
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

    options.signal?.throwIfAborted();

    if (timeoutExpired) {
      throw 'Timeout expired';
    }

    return result;
  }

  async writeAndDrain(data: string | Buffer, encoding: BufferEncoding = 'ascii') {
    await this.writeAsync(data, encoding);
    await this.drainAsync();
  }
}
