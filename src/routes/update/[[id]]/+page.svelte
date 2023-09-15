<script lang="ts">
  import log from 'electron-log';
  import { Screenshots } from 'node-screenshots';
  import QrScanner from 'qr-scanner';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { onDestroy, onMount } from 'svelte';
  import { DefaultTokenDuration, TokenInfo } from '$models/token-info';
  import { TokenHashingAlgo, tokenHashingAlgoFromString } from '$models/token-hashing-algo';
  import { TokenLength, tokenLengthFromNumber } from '$models/token-length';
  import { TokenSecretEncoding } from '$models/token-secret-encoding';
  import { TokenAutomationFeature } from '$models/token-automation-feature';
  import { goto } from '$app/navigation';
  import { parse } from '$lib/url-otpauth-ts/parse';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { page } from '$app/stores';
  import { blur, slide } from 'svelte/transition';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { Accordion, AccordionItem, RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
  import CameraQrScanner from '$components/camera-qr-scanner/camera-qr-scanner.svelte';

  GlobalCommonToast.initialize();

  let cameraScanEnabled: boolean = false;
  let abortController = new AbortController();
  let tokenInfo: TokenInfo | null | undefined;
  let availableTokenHashingAlgo: [string, TokenHashingAlgo][] = Object.entries(TokenHashingAlgo);
  let availableTokenLength: TokenLength[] = Object.values(TokenLength);
  let availableTokenSecretEncoding: [string, TokenSecretEncoding][] = Object.entries(TokenSecretEncoding);
  let availableTokenAutomationFeatures: [string, TokenAutomationFeature][] = [
    ['Type slower', TokenAutomationFeature.Slower],
    ['Press enter at the end', TokenAutomationFeature.Enter],
    ['Press tab at the end', TokenAutomationFeature.Tab],
  ];

  function formatAccountName(issuer: string | null | undefined, account: string | null | undefined) {
    if (issuer && account) return `${issuer} (${account})`;
    return account || issuer || '';
  }

  async function onScanQrCodeOnScreenClicked() {
    GlobalPreloader.show('Looking for QR code on a screen');
    // https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992
    let scannedData: string | null = null;
    tokenInfo = null;
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

    await processQrCodeScanData(scannedData);

    GlobalPreloader.hide();
  }

  function onScanQrCodeOnCameraClicked() {
    cameraScanEnabled = !cameraScanEnabled;
  }

  function onCameraQrCodeScanned(e: CustomEvent<{ data: string }>) {
    cameraScanEnabled = false;
    processQrCodeScanData(e.detail.data);
  }

  async function processQrCodeScanData(scannedData: string | null | undefined) {
    if (scannedData) {
      try {
        const parsedTotpUri = parse(scannedData);
        tokenInfo = new TokenInfo({
          name: formatAccountName(parsedTotpUri.issuer, parsedTotpUri.account),
          length: tokenLengthFromNumber(parsedTotpUri.digits),
          secret: parsedTotpUri.key,
          duration: parsedTotpUri.period || DefaultTokenDuration,
          hashingAlgo: tokenHashingAlgoFromString(parsedTotpUri.algorithm),
        });
      } catch (e) {
        log.error(e);
        GlobalCommonToast.show('QR code found but seems to be non-valid 2FA QR code', CommonToastType.Warning);
      }
    } else {
      GlobalCommonToast.show('No valid QR code found on a screen', CommonToastType.Warning);
    }
  }

  function onManualEntryClicked() {
    tokenInfo = new TokenInfo();
  }

  async function saveToken() {
    if (tokenInfo) {
      try {
        await SharedTotpAppClient.updateToken(tokenInfo, abortController.signal);
        await goto('/');
        GlobalCommonToast.show(`Token ${tokenInfo.name} has been successfully added`, CommonToastType.Success);
      } catch (e) {
        GlobalCommonToast.show('An error occurred during token saving', CommonToastType.Error);
        log.error(e);
      }
    }
  }

  async function loadTokenInfoIfEdit() {
    if ($page.params.id) {
      try {
        tokenInfo = await SharedTotpAppClient.getTokenDetails(Number($page.params.id), abortController.signal);
      } catch (e) {
        log.error(e);
        await goto('/');
        GlobalCommonToast.show(`Unable to load token details`, CommonToastType.Error);
      }
    }
  }

  onDestroy(() => abortController.abort());
  onMount(() => loadTokenInfoIfEdit());
</script>

<div class="flex h-max min-h-full">
  {#if tokenInfo}
    <form class="w-full p-4" on:submit={saveToken} transition:blur>
      <input class="input mb-3" type="text" placeholder="Name" required bind:value={tokenInfo.name} />
      <input
        class="input mb-3"
        type="password"
        placeholder="Secret"
        required={tokenInfo.id <= 0}
        bind:value={tokenInfo.secret} />
      <Accordion>
        <AccordionItem>
          <svelte:fragment slot="summary">
            <h3 class="font-bold">Additional settings</h3>
          </svelte:fragment>
          <svelte:fragment slot="content">
            <label class="label mb-3" for="rbgHashingAlgorithm">
              <span class="block">Hashing algorithm</span>
              <RadioGroup id="rbgHashingAlgorithm" active="variant-filled-primary" hover="hover:variant-soft-primary">
                {#each availableTokenHashingAlgo as [name, algo]}
                  <RadioItem class="uppercase" name="Hashing algorithm" bind:group={tokenInfo.hashingAlgo} value={algo}>
                    {name}
                  </RadioItem>
                {/each}
              </RadioGroup>
            </label>

            <label class="label mb-3" for="rbgTokenLength">
              <span class="block">Token length</span>
              <RadioGroup id="rbgTokenLength" active="variant-filled-primary" hover="hover:variant-soft-primary">
                {#each availableTokenLength as len}
                  <RadioItem name="Token length" bind:group={tokenInfo.length} value={len}>{len} digits</RadioItem>
                {/each}
              </RadioGroup>
            </label>

            <label class="label mb-3">
              <span class="block">Token duration (seconds)</span>
              <input type="number" class="input max-w-xs" min="15" max="255" required bind:value={tokenInfo.duration} />
            </label>

            <label class="label mb-3" for="rbgTokenSecretEncoding">
              <span class="block">Token secret encoding</span>
              <RadioGroup
                id="rbgTokenSecretEncoding"
                active="variant-filled-primary"
                hover="hover:variant-soft-primary">
                {#each availableTokenSecretEncoding as [name, enc]}
                  <RadioItem
                    class="uppercase"
                    name="Token secret encoding"
                    bind:group={tokenInfo.secretEncoding}
                    value={enc}>
                    {name}
                  </RadioItem>
                {/each}
              </RadioGroup>
            </label>
          </svelte:fragment>
        </AccordionItem>
        <AccordionItem>
          <svelte:fragment slot="summary">
            <h3 class="font-bold">Automation settings</h3>
          </svelte:fragment>
          <svelte:fragment slot="content">
            {#each availableTokenAutomationFeatures as [displayName, feature]}
              <div class="block">
                <SlideToggle name="{feature}-label" size="sm" bind:checked={tokenInfo.automationFeatures[feature]}>
                  {displayName}
                </SlideToggle>
              </div>
            {/each}
          </svelte:fragment>
        </AccordionItem>
      </Accordion>
      <div class="mt-4 flex justify-center">
        <button type="submit" class="btn variant-filled-primary ml-auto w-20 -mr-20">Save</button>
        <a href="/" type="reset" class="btn variant-ghost ml-auto">Cancel</a>
      </div>
    </form>
  {:else}
    <div class="flex mx-auto justify-center flex-col w-full max-w-sm">
      <div class="flex flex-col">
        <div class="flex items-center justify-center mb-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 122.61 122.88"
            stroke-width="1.5"
            fill="currentColor"
            class="w-8 h-8 mr-3">
            <path
              d="M26.68 26.77h25.23v25.12H26.68V26.77ZM35.67 0h-12.6a22.72 22.72 0 0 0-8.77 1.75 23.13 23.13 0 0 0-7.49 5 23.16 23.16 0 0 0-5 7.49A22.77 22.77 0 0 0 0 23.07v15.57h10.23V23.07a12.9 12.9 0 0 1 1-4.9A12.71 12.71 0 0 1 14 14a12.83 12.83 0 0 1 9.07-3.75h12.6V0Zm63.87 0h-8.23v10.23h8.23a12.94 12.94 0 0 1 4.9 1 13.16 13.16 0 0 1 4.17 2.77l.35.36a13.07 13.07 0 0 1 2.45 3.82 12.67 12.67 0 0 1 1 4.89v15.57h10.23V23.07a22.95 22.95 0 0 0-6.42-15.93l-.37-.37a23.16 23.16 0 0 0-7.49-5A22.77 22.77 0 0 0 99.54 0Zm23.07 99.81V82.52h-10.23v17.29a12.67 12.67 0 0 1-1 4.89 13.08 13.08 0 0 1-2.8 4.17 12.8 12.8 0 0 1-9.06 3.78h-8.21v10.23h8.23a23 23 0 0 0 16.29-6.78 23.34 23.34 0 0 0 5-7.49 23 23 0 0 0 1.75-8.8Zm-99.54 23.07h12.6v-10.23h-12.6a12.8 12.8 0 0 1-9.07-3.78l-.26-.24a12.83 12.83 0 0 1-2.61-4.08 12.7 12.7 0 0 1-.91-4.74V82.52H0v17.29a22.64 22.64 0 0 0 1.67 8.57 22.86 22.86 0 0 0 4.79 7.38l.31.35a23.2 23.2 0 0 0 7.5 5 22.84 22.84 0 0 0 8.8 1.75Zm66.52-33.1H96v6.33h-6.41v-6.33Zm-12.36 0h6.44v6H70.8V83.47H77v-6.25h6.34V64.76h6.46v6.12h6.12v6.33H89.8v6.33H77.23v6.23ZM58.14 77.12h6.23v-6.33h-6v-6.33h6v-6.33h-6.13v6.33H51.8v-6.33h6.33v-18.8h6.43v18.79h6.23v6.33h6.13v-6.33h6.43v6.33h-6.12v6.33H70.8v12.46h-6.23v12.57h-6.43V77.12Zm31.35-19h6.43v6.33h-6.43v-6.33Zm-50.24 0h6.43v6.33h-6.43v-6.33Zm-12.57 0h6.43v6.33h-6.43v-6.33Zm31.46-31.35h6.43v6.33h-6.43v-6.33ZM26.58 70.88H51.8V96H26.58V70.88ZM32.71 77h13v12.91h-13V77Zm38-50.22h25.21v25.11H70.7V26.77Zm6.13 6.1h13v12.91h-13V32.87Zm-44 0h13v12.91h-13V32.87Z"
              style="fill-rule:evenodd" />
          </svg>
          Scan QR code
        </div>
        <div class="flex gap-3">
          <button class="btn btn-lg variant-filled-primary flex-grow" on:click={onScanQrCodeOnScreenClicked}>
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
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
            <span>On Screen</span>
          </button>
          <button class="btn btn-lg variant-filled-primary flex-grow" on:click={onScanQrCodeOnCameraClicked}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6">
              <path
                stroke-linecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>On Camera</span>
          </button>
        </div>
      </div>
      {#if cameraScanEnabled}
        <div class="mt-3 w-full" transition:slide>
          <CameraQrScanner on:scanned={onCameraQrCodeScanned} />
        </div>
      {/if}
      <p class="block m-4 text-center">OR</p>
      <button class="btn variant-ghost btn-lg" on:click={onManualEntryClicked}>
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <span>Enter manually</span>
      </button>
    </div>
  {/if}
</div>
