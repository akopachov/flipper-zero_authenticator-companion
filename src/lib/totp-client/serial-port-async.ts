import type { SerialPort } from "serialport";

export function flushAsync(port: SerialPort) {
  return new Promise<void>((resolve, reject) => {
    port.flush(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function openAsync(port: SerialPort) {
  return new Promise<void>((resolve, reject) => {
    port.open(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function closeAsync(port: SerialPort) {
  return new Promise<void>((resolve, reject) => {
    port.close(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function writeAsync(port: SerialPort, data: string | Buffer, encoding: BufferEncoding) {
  return new Promise<void>((resolve, reject) => {
    port.write(data, encoding, error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function drainAsync(port: SerialPort) {
  return new Promise<void>((resolve, reject) => {
    port.drain(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}
