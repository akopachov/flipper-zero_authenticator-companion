export function serialFlush(port) {
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
