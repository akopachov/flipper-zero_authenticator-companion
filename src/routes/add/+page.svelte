<script lang="ts">
  import Accordion, { Content, Header, Panel } from '@smui-extra/accordion';
  import { Screenshots } from 'node-screenshots';
  import Button from '@smui/button';
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

<Accordion>
  <Panel open={true}>
    <Header>Scan QR code</Header>
    <Content>
      <Button on:click={async () => await tryScanQrCode()}>Scan QR code</Button>
      {#if scannedData}
        <p>{scannedData}</p>
      {/if}
    </Content>
  </Panel>
  <Panel>
    <Header>Enter details manually</Header>
    <Content>TBD</Content>
  </Panel>
</Accordion>

<style></style>
