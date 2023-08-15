<script lang="ts">
  import Accordion, { Content, Header, Panel } from '@smui-extra/accordion';
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
