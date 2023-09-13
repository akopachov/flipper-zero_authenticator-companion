<script lang="ts">
  import log from 'electron-log';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { Screenshots } from 'node-screenshots';
  import QrScanner from 'qr-scanner';
  import { importFromGoogleAuthenticator } from '$lib/import';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import type { TokenInfo } from '$models/token-info';
  import { blur } from 'svelte/transition';
  import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
  import { findIcon } from '$lib/totp-icons';

  GlobalCommonToast.initialize();

  let abortController = new AbortController();

  let tokensParsed: TokenInfo[] | null = null;
  let tokensToImport: TokenInfo[] = [];

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `./totp-icons/${iconFileName}`;
  }

  async function importFromGoogleAuth() {
    GlobalPreloader.show('Looking for QR code on a screen');

    let scannedData: string | null = null;
    for (const capture of Screenshots.all()) {
      const screenshot = await capture.capture();
      let scanResult: QrScanner.ScanResult | undefined;
      try {
        const blob = new Blob([screenshot]);
        scanResult = await QrScanner.scanImage(blob, { returnDetailedScanResult: true });
      } catch {
        /* empty */
      }

      if (scanResult) {
        scannedData = scanResult.data;
        break;
      }
    }

    if (scannedData) {
      try {
        tokensParsed = importFromGoogleAuthenticator(scannedData);
      } catch (e) {
        log.error(e);
        GlobalCommonToast.show(
          'QR code found but seems to be non-valid Google Authenticator migration QR code',
          CommonToastType.Warning,
        );
      }
    } else {
      GlobalCommonToast.show('No valid QR code found on a screen', CommonToastType.Warning);
    }

    GlobalPreloader.hide();
  }

  async function doImport() {
    if (tokensToImport.length > 0) {
      for (const token of tokensToImport) {
        await SharedTotpAppClient.updateToken(token, abortController.signal);
        abortController.signal.throwIfAborted();
      }

      await goto('/');
      GlobalCommonToast.show(
        `${tokensToImport.length} tokens have been successfully imported`,
        CommonToastType.Success,
      );
    } else {
      GlobalCommonToast.show('There is no token selected', CommonToastType.Warning);
    }
  }

  onDestroy(() => abortController.abort());
</script>

<div class="flex h-max min-h-full">
  {#if tokensParsed}
    <form class="flex flex-col w-full p-4" transition:blur on:submit={doImport}>
      <h4 class="h4 text-center mb-3">Select accounts to import</h4>
      <ListBox multiple>
        {#each tokensParsed as token}
          <ListBoxItem class="pr-6" bind:group={tokensToImport} name={token.name} value={token}>
            <svelte:fragment slot="lead">
              <img class="h-10 w-auto object-cover" src={getIcon(token.name)} alt="icon" />
            </svelte:fragment>
            {token.name}
          </ListBoxItem>
        {/each}
      </ListBox>
      <div class="mt-4 flex justify-center">
        <button type="submit" class="btn variant-filled-primary ml-auto w-20 -mr-20">Import</button>
        <a href="/" type="reset" class="btn variant-ghost ml-auto">Cancel</a>
      </div>
    </form>
  {:else}
    <div class="flex mx-auto justify-center flex-col w-full max-w-sm">
      <button class="btn variant-ghost btn-lg" on:click={importFromGoogleAuth}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xml:space="preserve"
          baseProfile="basic"
          viewBox="0 0 512 512"
          class="w-12 h-12"
          stroke-width="1.5">
          <path
            fill="#1A73E8"
            d="M440 256c0 17.12-13.88 31-31 31H302l-46-93.01 49.65-85.995c8.56-14.826 27.519-19.907 42.346-11.347l.006.003c14.828 8.56 19.908 27.52 11.348 42.347L309.7 225H409c17.12 0 31 13.88 31 31z" />
          <path
            fill="#EA4335"
            d="m348.002 415.349-.006.003c-14.827 8.56-33.785 3.48-42.345-11.347L256 318.01l-49.65 85.995c-8.56 14.826-27.519 19.907-42.346 11.347l-.006-.003c-14.827-8.56-19.908-27.52-11.348-42.347L202.3 287l53.7-2 53.7 2 49.65 86.002c8.56 14.828 3.48 33.787-11.348 42.347z" />
          <path
            fill="#FBBC04"
            d="M256 193.99 242 232l-39.7-7-49.65-86.002c-8.56-14.828-3.48-33.787 11.348-42.347l.006-.003c14.827-8.56 33.785-3.48 42.345 11.347L256 193.99z" />
          <path fill="#34A853" d="m248 225-36 62H103c-17.12 0-31-13.88-31-31 0-17.12 13.88-31 31-31h145z" />
          <path fill="#185DB7" d="M309.7 287H202.3l53.7-93.01z" />
        </svg>
        <span>Google Authenticator</span>
      </button>
    </div>
  {/if}
</div>
