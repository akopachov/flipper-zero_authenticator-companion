<script lang="ts">
  import log from 'electron-log';
  import { goto } from '$app/navigation';
  import { findIcon } from '$lib/totp-icons';
  import { TokenInfo } from '$models/token-info';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { decodeDataFromQueryString } from '$lib/query-string-utils';
  import { GlobalPreloader } from '$stores/global-preloader';

  GlobalCommonToast.initialize();

  let abortController = new AbortController();

  let tokensParsed: TokenInfo[] = [];
  let tokensToImport: TokenInfo[] = [];

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `/totp-icons/${iconFileName}`;
  }

  async function doImport() {
    if (tokensToImport.length > 0) {
      try {
        for (const token of tokensToImport) {
          await SharedTotpAppClient.updateToken(token, abortController.signal);
          abortController.signal.throwIfAborted();
        }

        await goto('/');
        GlobalCommonToast.show(
          `${tokensToImport.length} tokens have been successfully imported`,
          CommonToastType.Success,
        );
      } catch (e) {
        log.error(e);
        GlobalCommonToast.show('An error ocurred during token import', CommonToastType.Error);
      }
    } else {
      GlobalCommonToast.show('There is no token selected', CommonToastType.Warning);
    }
  }

  async function loadData() {
    if ($page.url.searchParams.has('data')) {
      tokensToImport = tokensParsed = decodeDataFromQueryString($page.url.searchParams.get('data') || '').map(
        m => new TokenInfo(m),
      );
    } else {
      await goto('/');
    }
  }

  onMount(() => loadData());
  onDestroy(() => abortController.abort());
</script>

<form class="flex flex-col w-full p-4" on:submit={doImport}>
  <h4 class="h4 text-center mb-3">Select accounts to import</h4>
  <ul class="list pt-3 pb-3">
    {#each tokensParsed as token}
      <li class="h-14 p-1">
        <label class="flex items-center space-x-2">
          <input class="checkbox" type="checkbox" value={token} bind:group={tokensToImport} />
        </label>
        <img class="avatar-image h-full w-auto object-cover" src={getIcon(token.name)} alt="icon" />
        <p class="flex-auto block min-w-0">
          <span class="block text-base truncate">{token.name}</span>
          <span class="block text-sm uppercase">{token.hashingAlgo}</span>
        </p>
      </li>
    {/each}
  </ul>
  <div class="mt-4 flex justify-center">
    <button type="submit" class="btn variant-filled-primary ml-auto w-20 -mr-20">Import</button>
    <a href="/" type="reset" class="btn variant-ghost ml-auto">Cancel</a>
  </div>
</form>
