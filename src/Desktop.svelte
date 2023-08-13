<script>
  export let totpAppClient;

  let totpCommandReady = false;

  async function main() {
    await totpAppClient.waitForApp();
    totpCommandReady = true;
    console.log(await totpAppClient.listTokens());
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
