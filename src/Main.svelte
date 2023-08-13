<script>
  import { Router, navigate, Route } from "svelte-routing";
  import { ipcRenderer } from 'electron';
  import { SerialPort } from 'serialport';
  import delay from 'delay'
  import Desktop from './Desktop.svelte';
  import "@fontsource/material-icons";
  import "@fontsource/roboto";
  import 'smelte/src/tailwind.css';
  import Button from "smelte/src/components/Button";
  import { FlipperVendorId, FlipperProductId, FlipperCliEndOfCommand } from './helpers/constants';
  import { serialReadUntil } from "./helpers/serial-read-until";

  export let url = "/";
  let serialPort = null;

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

  async function waitForFlipperZeroCli() {
    do {
      let flipperZeroDevice = await waitForFlipperZeroDevice();
      serialPort = new SerialPort({ path: flipperZeroDevice.path, baudRate: 230400, autoOpen: false });
      const error = await new Promise((resolve, reject) => serialPort.open(resolve));
      if (error != null) {
        serialPort = null;
        await delay(1000);
      } else {
        await serialReadUntil(serialPort, FlipperCliEndOfCommand, 1000);
      }
    } while (serialPort == null);
  }

  function closeSerialPort () {
    if (serialPort != null) {
      serialPort.close();
    }
  }

  async function main() {
    await waitForFlipperZeroCli();
    serialPort.on('close', e => {
      if (e && e.disconnected) {
        ipcRenderer.send('totpca:force-reload', {});
      }
    });
    navigate('/desktop');
  }

  main();

</script>

<svelte:window on:beforeunload={closeSerialPort}/>

<main>
  <Router {url}>
    <Route path="/">
      <Button>Test</Button>
      <h1>Waiting for flipper...</h1>
    </Route>
    <Route path="/desktop">
      <Desktop {serialPort}></Desktop>
    </Route>
  </Router>
</main>

<style>

</style>
