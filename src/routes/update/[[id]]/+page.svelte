<script lang="ts">
  import log from 'electron-log';
  import { Screenshots } from 'node-screenshots';
  import QrScanner from 'qr-scanner';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { onDestroy, onMount } from 'svelte';
  import { TokenInfo } from '$models/token-info';
  import { TokenHashingAlgo, tokenHashingAlgoFromString } from '$models/token-hashing-algo';
  import { TokenLength, tokenLengthFromNumber } from '$models/token-length';
  import { TokenSecretEncoding } from '$models/token-secret-encoding';
  import { TokenAutomationFeature } from '$models/token-automation-feature';
  import { goto } from '$app/navigation';
  import { parse } from 'url-otpauth-ng';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { page } from '$app/stores';
  import { blur } from 'svelte/transition';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { Accordion, AccordionItem, RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';

  GlobalCommonToast.initialize();

  let abortController = new AbortController();
  let scannedData: string | null = null;
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
    if (issuer) return issuer;
    return account || '';
  }

  async function onScanQrCodeClicked() {
    GlobalPreloader.show('Looking for QR code');
    // https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992
    scannedData = null;
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

    if (scannedData) {
      try {
        const parsedTotpUri = parse(scannedData);
        tokenInfo = new TokenInfo({
          name: formatAccountName(parsedTotpUri.issuer, parsedTotpUri.account),
          length: tokenLengthFromNumber(parsedTotpUri.digits),
          secret: parsedTotpUri.key,
          duration: parsedTotpUri.period || 30,
          hashingAlgo: tokenHashingAlgoFromString(parsedTotpUri.algorithm),
        });
      } catch (e) {
        log.error(e);
      }
    }

    if (!tokenInfo) {
      GlobalCommonToast.show('No valid QR code found', CommonToastType.Warning);
    }

    GlobalPreloader.hide();
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
      <div class="m-4 flex justify-center">
        <button type="submit" class="btn variant-filled-primary ml-auto w-20 -mr-20">Save</button>
        <a href="/" type="reset" class="btn variant-ghost ml-auto">Cancel</a>
      </div>
    </form>
  {:else}
    <div class="flex mx-auto justify-center flex-col w-full max-w-sm">
      <button class="btn variant-filled-primary btn-lg" on:click={onScanQrCodeClicked}>
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
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
        </svg>
        <span>Scan QR code</span>
      </button>
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
