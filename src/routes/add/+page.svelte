<script lang="ts">
  import { rpcToMain } from '$lib/electron-rpc/electron-rpc_renderer';
  import Button from '@smui/button';
  import QrScanner from 'qr-scanner';

  let scannedData: string | null = null;

  async function tryScanQrCode() {
    const screenshot = await rpcToMain<string>('screenshot:capture');
    let scanResult;
    try {
      scanResult = await QrScanner.scanImage(screenshot, { returnDetailedScanResult: true });
    } catch (e) {
      console.warn(e);
    }

    if (scanResult) {
      scannedData = scanResult.data;
    } else {
      scannedData = 'No QR code found';
    }
  }
</script>

<Button on:click={async () => await tryScanQrCode()}>Scan QR code</Button>
{#if scannedData}
  <p>{scannedData}</p>
{/if}

<style></style>
