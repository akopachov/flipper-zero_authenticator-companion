<script>
  import { serialWaitForTotp } from './helpers/serial-wait-for-totp';
  import { serialFlush } from './helpers/serial-flush'

  export let serialPort;

  let totpCommandReady = false;

  async function main() {
    await serialFlush(serialPort);
    await serialWaitForTotp(serialPort);
    totpCommandReady = true;
  }

  main();
</script>

{#if totpCommandReady}
<h1>Ready!</h1>
{:else}
<h2>Waiting for TOTP app</h2>
{/if}

<style>
    
</style>
