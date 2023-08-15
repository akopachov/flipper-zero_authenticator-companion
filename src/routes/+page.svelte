<script lang="ts">
  import { SharedTotpAppClient } from '$lib/totp-client';
  import { goto } from '$app/navigation';

  async function main() {
    await SharedTotpAppClient.waitForDevice();
    await goto('/list', { replaceState: true });
  }

  main();
</script>

<main>
  <h1>Waiting for flipper...</h1>
</main>

<style>
</style>
