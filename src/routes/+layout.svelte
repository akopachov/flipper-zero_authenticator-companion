<script lang="ts">
  import '@fontsource/roboto';
  import '@fontsource/material-icons';
  import { fade } from 'svelte/transition';
  import TopAppBar, { Row, Title, Section } from '@smui/top-app-bar';
  import Drawer, { Content, AppContent, Scrim } from '@smui/drawer';
  import List, { Item, Graphic, Text } from '@smui/list';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import { onMount } from 'svelte';
  import { SharedTotpAppClient } from '../stores/totp-shared-client';
  import { goto } from '$app/navigation';
  import { navigating, page } from '$app/stores';
  import { TotpClientEvents } from '$lib/totp-client';

  let ready = false;
  let processingRequest = 0;
  let processingRequestDetails = '';
  let isMenuOpen = false;
  let activePath = $page.url.pathname;

  onMount(() => {
    ready = true;
  });

  $: {
    if ($navigating) {
      activePath = $navigating.to?.url.pathname || '/';
    }
  }

  function closeTotpAppClient() {
    $SharedTotpAppClient.close();
  }

  async function addTokenClicked() {
    await goto('/add');
  }

  async function activateMenuItem(route: string) {
    isMenuOpen = false;
    await goto(route);
  }

  $SharedTotpAppClient.on(TotpClientEvents.Connecting, () => {
    processingRequestDetails = 'Connecting to Flipper Zero device';
  });

  $SharedTotpAppClient.on(TotpClientEvents.Connected, () => {
    processingRequestDetails = '';
  });

  $SharedTotpAppClient.on(TotpClientEvents.CommandExecuting, () => {
    processingRequest++;
    processingRequestDetails = 'Executing command on Flipper Zero device';
  });

  $SharedTotpAppClient.on(TotpClientEvents.CommandExecuted, () => {
    processingRequest--;
    processingRequestDetails = '';
  });

  $SharedTotpAppClient.on(TotpClientEvents.PinRequested, () => {
    processingRequestDetails = 'PIN is requested on Flipper Zero device';
  });

  $SharedTotpAppClient.on(TotpClientEvents.WaitForApp, () => {
    processingRequestDetails = 'Waiting for Authenticator app top be launched on Flipper Zero device';
  });
</script>

<svelte:window on:beforeunload={closeTotpAppClient} />

{#if ready}
  <div class="drawer-container">
    <Drawer variant="modal" fixed={false} bind:open={isMenuOpen}>
      <Content>
        <List>
          <Item href="javascript:void(0)" on:click={() => activateMenuItem('/add')} activated={activePath === '/add'}>
            <Graphic class="material-icons" aria-hidden="true">add</Graphic>
            <Text>Add new token</Text>
          </Item>
          <Item href="javascript:void(0)" on:click={() => activateMenuItem('/')} activated={activePath === '/'}>
            <Graphic class="material-icons" aria-hidden="true">list</Graphic>
            <Text>List</Text>
          </Item>
        </List>
      </Content>
    </Drawer>
    <Scrim fixed={false} />
    <AppContent>
      <TopAppBar variant="static">
        <Row>
          <Section>
            <IconButton class="material-icons" on:click={() => (isMenuOpen = true)}>menu</IconButton>
            <Title>Flipper Authenticator Companion</Title>
          </Section>
          <Section align="end" toolbar>
            <IconButton class="material-icons" aria-label="Add" on:click={async () => await addTokenClicked()}>
              add
            </IconButton>
          </Section>
        </Row>
      </TopAppBar>
      <slot />
    </AppContent>
  </div>
  {#if processingRequest > 0}
    <div out:fade={{ duration: 300 }} class="processing-request">
      <CircularProgress class="progress" style="height: 128px; width: 128px;" indeterminate />
      <h5 class="description">{processingRequestDetails}</h5>
    </div>
  {/if}
{/if}

<style lang="scss">
  .processing-request {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .description {
      text-align: center;
    }
  }
</style>
