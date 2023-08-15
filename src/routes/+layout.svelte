<script lang="ts">
  import '@fontsource/roboto';
  import '@fontsource/material-icons';
  import TopAppBar, { Row, Title, Section } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { onMount } from 'svelte';
  import { SharedTotpAppClient } from '$lib/totp-client';
  import { goto } from '$app/navigation';

  let ready: boolean = false;

  if ((<any>window).SharedTotpAppClient) {
    (<any>window).SharedTotpAppClient.close();
  }

  (<any>window).SharedTotpAppClient = SharedTotpAppClient;

  onMount(() => (ready = true));

  function closeTotpAppClient() {
    SharedTotpAppClient.close();
  }

  async function addTokenClicked() {
    await goto('/add');
  }
</script>

<svelte:window on:beforeunload={closeTotpAppClient} />

{#if ready}
  <TopAppBar variant="static">
    <Row>
      <Section>
        <IconButton class="material-icons">menu</IconButton>
        <Title>Flipper Authenticator Companion</Title>
      </Section>
      <Section align="end" toolbar>
        <IconButton
          class="material-icons"
          aria-label="Add"
          on:click={async () => await addTokenClicked()}
        >
          add
        </IconButton>
      </Section>
    </Row>
  </TopAppBar>
  <slot />
{/if}

<style>
</style>
