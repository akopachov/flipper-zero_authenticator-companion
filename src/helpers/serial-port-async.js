export function flushAsync(port) {
  return new Promise((resolve, reject) => {
    port.flush(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function openAsync(port) {
  return new Promise((resolve, reject) => {
    port.open(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function closeAsync(port) {
  return new Promise((resolve, reject) => {
    port.close(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function writeAsync(port, data, encoding) {
  return new Promise((resolve, reject) => {
    port.write(data, encoding, error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export function drainAsync(port) {
  return new Promise((resolve, reject) => {
    port.drain(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}
