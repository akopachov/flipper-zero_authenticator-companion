<script lang="ts">
  import '@fontsource/roboto';
  import '@fontsource/material-icons';
  import { onMount } from 'svelte';
  import { SharedTotpAppClient } from '$lib/totp-client';

  let ready: boolean = false;

  onMount(() => (ready = true));

  function closeTotpAppClient() {
    SharedTotpAppClient.close();
  }
</script>

<svelte:window on:beforeunload={closeTotpAppClient} />

{#if ready}
  <slot />
{/if}

<style>
</style>
