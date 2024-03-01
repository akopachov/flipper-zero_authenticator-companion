<script lang="ts">
  import '../app.postcss';
  import log from 'electron-log';
  import { onMount } from 'svelte';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { navigating, page } from '$app/stores';
  import { TotpClientEvents } from '$lib/totp-client';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { AppBar, AppShell, Drawer, storePopup, getDrawerStore, Modal, Toast } from '@skeletonlabs/skeleton';
  import { getAppSettings } from '$stores/app-settings';
  import { AvailableTimeProviders } from '$lib/time-providers';
  import { AvailableTimezoneProviders } from '$lib/timezone-providers';
  import CommonPreloader from '$components/common-preloader/common-preloader.svelte';
  import Lightswitch from '$components/lightswitch/lightswitch.svelte';
  import { theme } from '$components/lightswitch/actions';

  initializeStores();

  const drawerStore = getDrawerStore();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  let ready = false;

  onMount(async () => {
    ready = true;
  });

  $: $navigating && drawerStore.close();

  $: classesActivePage = (href: string) =>
    href === $page.url.pathname ? '!bg-primary-500 focus:!bg-primary-500' : 'focus:!bg-inherit';

  async function closeTotpAppClient() {
    await SharedTotpAppClient.close();
  }

  function openMainMenu() {
    drawerStore.open({
      width: 'w-[280px]',
    });
  }

  SharedTotpAppClient.on(TotpClientEvents.Connecting, () => {
    GlobalPreloader.setDescription('Waiting for Flipper Zero device');
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
    GlobalPreloader.setDescription('Waiting for Authenticator app to be launched on Flipper Zero device');
  });

  SharedTotpAppClient.on(TotpClientEvents.ConnectionError, (_, e) => {
    log.debug('Error occurred during connecting to Flipper device', e);
  });

  async function sync() {
    const appSettings = getAppSettings();
    if (appSettings.dateTime.syncAtStartup) {
      await SharedTotpAppClient.setDeviceDatetime(
        await AvailableTimeProviders[appSettings.dateTime.provider].getCurrentTime(),
      );
    }
    if (appSettings.timezone.syncAtStartup) {
      await SharedTotpAppClient.setAppTimezone(
        await AvailableTimezoneProviders[appSettings.timezone.provider].getCurrentTimezoneOffset(),
      );
    }
  }

  sync();
</script>

<svelte:window on:beforeunload={closeTotpAppClient} />
<svelte:document use:theme />

{#if ready}
  <Modal />
  <Toast />
  <CommonPreloader />
  <Drawer>
    <nav class="list-nav p-2 h-full">
      <ul class="h-full flex flex-col">
        <li>
          <a href="/update" class="{classesActivePage('/update')} focus:!text-inherit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="flex-auto">Add new token</span>
          </a>
        </li>
        <li>
          <a href="/" class={classesActivePage('/')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span class="flex-auto">List</span>
          </a>
        </li>
        <li>
          <a href="/import" class={classesActivePage('/import')}>
            <svg
              class="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              xml:space="preserve"
              viewBox="0 0 512 512"
              fill="currentColor">
              <path
                d="M457.14 347.43v128H54.86v-128c0-10.1-8.19-18.29-18.29-18.29s-18.29 8.19-18.29 18.29v146.29c0 4.81 1.95 9.53 5.36 12.93a18.39 18.39 0 0 0 12.93 5.36h438.86c4.81 0 9.52-1.95 12.93-5.36 3.4-3.4 5.36-8.11 5.36-12.93V347.43c0-10.1-8.19-18.29-18.29-18.29s-18.29 8.19-18.29 18.29zM237.71 18.29V384c0 10.1 8.19 18.29 18.29 18.29s18.29-8.19 18.29-18.29V18.29C274.29 8.19 266.1 0 256 0s-18.29 8.19-18.29 18.29zM96.78 250.64l146.29 146.29c3.4 3.4 8.11 5.36 12.93 5.36 4.81 0 9.52-1.95 12.93-5.36l146.29-146.29c7.14-7.14 7.14-18.72 0-25.86-7.14-7.14-18.72-7.14-25.86 0L256 358.14 122.64 224.78c-7.14-7.14-18.72-7.14-25.86 0-7.14 7.15-7.14 18.72 0 25.86z" />
            </svg>
            <span class="flex-auto">Import</span>
          </a>
        </li>
        <li>
          <a href="/settings" class={classesActivePage('/settings')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="flex-auto">Settings</span>
          </a>
        </li>
        <li class="!mt-auto text-center">
          <div>
            <a
              class="anchor"
              target="_blank"
              href="external-https://github.com/akopachov/flipper-zero_authenticator-companion?tab=readme-ov-file#want-to-say-thank-you">
              Say thank you to a developer
            </a>
          </div>
          <Lightswitch />
        </li>
      </ul>
    </nav>
  </Drawer>
  <AppShell>
    <svelte:fragment slot="header">
      <AppBar>
        <svelte:fragment slot="lead">
          <button type="button" class="btn-icon bg-initial btn-lg" on:click={openMainMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </svelte:fragment>
        <h1 class="h3">Flipper Authenticator Companion</h1>
        <svelte:fragment slot="trail">
          <a href="/update" class="btn-icon bg-initial btn-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </a>
        </svelte:fragment>
      </AppBar>
    </svelte:fragment>

    <slot />
  </AppShell>
{/if}
