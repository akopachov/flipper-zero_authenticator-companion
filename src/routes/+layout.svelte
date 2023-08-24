<script lang="ts">
  import '@fontsource/roboto';
  import '@fontsource/material-icons';
  import TopAppBar, { Row, Title, Section } from '@smui/top-app-bar';
  import Drawer, { Content, AppContent, Scrim } from '@smui/drawer';
  import List, { Item, Graphic, Text, Separator } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { onMount } from 'svelte';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { navigating, page } from '$app/stores';
  import { TotpClientEvents } from '$lib/totp-client';
  import CommonDialog from '$components/common-dialog/common-dialog.svelte';
  import CommonSnackbar from '$components/common-snackbar/common-snackbar.svelte';
  import CommonPreloader from '$components/common-preloader/common-preloader.svelte';

  let ready = false;
  let isMenuOpen = false;
  let activePath = $page.url.pathname;

  onMount(() => {
    ready = true;
  });

  $: {
    if ($navigating) {
      isMenuOpen = false;
      activePath = $navigating.to?.url.pathname || '/';
    }
  }

  async function closeTotpAppClient() {
    await SharedTotpAppClient.close();
  }

  SharedTotpAppClient.on(TotpClientEvents.Connecting, () => {
    GlobalPreloader.setDescription('Connecting to Flipper Zero device');
  });

  SharedTotpAppClient.on(TotpClientEvents.Connected, () => {
    GlobalPreloader.clearDescription();
  });

  SharedTotpAppClient.on(TotpClientEvents.CommandExecuting, () => {
    GlobalPreloader.show('Executing command on Flipper Zero device');
  });

  SharedTotpAppClient.on(TotpClientEvents.CommandExecuted, () => {
    GlobalPreloader.hide();
  });

  SharedTotpAppClient.on(TotpClientEvents.PinRequested, () => {
    GlobalPreloader.setDescription('PIN is requested on Flipper Zero device');
  });

  SharedTotpAppClient.on(TotpClientEvents.WaitForApp, () => {
    GlobalPreloader.setDescription('Waiting for Authenticator app top be launched on Flipper Zero device');
  });
</script>

<svelte:window on:beforeunload={closeTotpAppClient} />

{#if ready}
  <div class="drawer-container">
    <Drawer class="main-menu" variant="modal" fixed={false} bind:open={isMenuOpen}>
      <Content>
        <List>
          <Item
            href="/update"
            activated={activePath === '/update'}
            data-sveltekit-reload={activePath.startsWith('/update/')}>
            <Graphic class="material-icons" aria-hidden="true">add</Graphic>
            <Text>Add new token</Text>
          </Item>
          <Item href="/" activated={activePath === '/'}>
            <Graphic class="material-icons" aria-hidden="true">list</Graphic>
            <Text>List</Text>
          </Item>
          <Separator />
          <Item href="/settings" activated={activePath === '/settings'}>
            <Graphic class="material-icons" aria-hidden="true">settings</Graphic>
            <Text>Settings</Text>
          </Item>
        </List>
      </Content>
    </Drawer>
    <Scrim fixed={false} />
    <AppContent class="app-content">
      <TopAppBar variant="static">
        <Row>
          <Section>
            <IconButton class="material-icons" on:click={() => (isMenuOpen = true)}>menu</IconButton>
            <Title>Flipper Authenticator Companion</Title>
          </Section>
          <Section align="end" toolbar>
            <IconButton
              class="material-icons"
              aria-label="Add"
              href="/update"
              data-sveltekit-reload={activePath.startsWith('/update/')}>
              add
            </IconButton>
          </Section>
        </Row>
      </TopAppBar>
      <div class="app-content-container">
        <slot />
      </div>
    </AppContent>
  </div>

  <CommonPreloader></CommonPreloader>
  <CommonDialog></CommonDialog>
  <CommonSnackbar></CommonSnackbar>
{/if}

<style lang="scss">
  .drawer-container {
    display: flex;
    height: 100%;
    width: 100%;

    :global(.main-menu) {
      width: 285px;
    }

    :global(.app-content) {
      height: 100%;
      min-width: 100%;
      overflow: hidden;
    }

    .app-content-container {
      height: calc(100% - 64px);
      min-width: 100%;
      display: flex;
      overflow: auto;

      :global(> *) {
        flex-basis: 100%;
      }
    }
  }
</style>
