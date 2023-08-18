<script lang="ts">
  import Fab, { Icon, Label } from '@smui/fab';
  import { Screenshots } from 'node-screenshots';
  import QrScanner from 'qr-scanner';
  import { onDestroy } from 'svelte';

  let abortController = new AbortController();
  let scannedData: string | null = null;

  async function tryScanQrCode() {
    scannedData = null;
    for (const capture of Screenshots.all()) {
      const screenshot = await capture.capture();
      let scanResult;
      try {
        const blob = new Blob([screenshot]);
        scanResult = await QrScanner.scanImage(blob, { returnDetailedScanResult: true });
      } catch (e) {
        console.warn(e);
      }

      if (scanResult) {
        scannedData = scanResult.data;
        break;
      }
    }

    if (!scannedData) {
      scannedData = 'No QR code found';
    }
  }

  onDestroy(() => abortController.abort());
</script>

<div class="container">
  <div class="scan-qr-container">
    <Fab color="primary" on:click={async () => await tryScanQrCode()} extended>
      <Icon class="material-icons">qr_code_scanner</Icon>
      <Label>Scan QR Code</Label>
    </Fab>
  </div>
  <form class="token-info"></form>
</div>

<style lang="scss">
  .container {
    .scan-qr-container {
      margin: 20px auto;
      display: flex;
      justify-content: center;
    }
  }
</style>
