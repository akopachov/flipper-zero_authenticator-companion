import { serialReadUntil } from "./serial-read-until";
import { serialWriteAndDrain } from "./serial-write-and-drain";
import { TotpCommand, FlipperCliEndOfCommand } from './constants';
import delay from "delay";

export async function serialWaitForTotp(port) {
  let ready = false;
  do {
    await serialWriteAndDrain(port, `${TotpCommand} ?\r`);
    const response = await serialReadUntil(port, FlipperCliEndOfCommand, 1000);
    ready = !response.includes('command not found');
    console.log(response);
    if (!ready) {
      await delay(1000);
    }
  } while (!ready)
}
