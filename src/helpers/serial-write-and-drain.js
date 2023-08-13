export async function serialWriteAndDrain (port, data) {
  await new Promise((resolve, reject) => {
    port.write(data, 'ascii', error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
  await new Promise((resolve, reject) => {
    port.drain(error => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}
