<script lang="ts">
  import Button from '@smui/button';
  import { SharedTotpAppClient } from '$lib/totp-client';
  import { goto } from '$app/navigation';

  async function main() {
    await SharedTotpAppClient.waitForDevice();
    goto('/list', { replaceState: true });
  }

  main();
</script>

<main>
  <Button>Test</Button>
  <h1>Waiting for flipper...</h1>
</main>

<style>
</style>
