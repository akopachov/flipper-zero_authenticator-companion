<script lang="ts">
  import log from 'electron-log';
  import { SharedTotpAppClient } from '../stores/totp-shared-client';
  import { onDestroy, onMount } from 'svelte';
  import type { TokenInfoBase } from '$models/token-info';
  import TotpList from '$components/totp-list/totp-list.svelte';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';

  let abortController = new AbortController();
  let totpList: TokenInfoBase[] | null = null;

  GlobalCommonToast.initialize();

  async function updateTokenList() {
    try {
      totpList = await SharedTotpAppClient.listTokens(abortController.signal);
    } catch (e) {
      GlobalCommonToast.show('An error occurred during querying token list', CommonToastType.Error, e);
      log.error(e);
    }
  }

  async function onListItemDelete(e: CustomEvent<{ token: TokenInfoBase }>) {
    try {
      await SharedTotpAppClient.removeToken(e.detail.token.id, abortController.signal);
      await updateTokenList();
      GlobalCommonToast.show(`Token "${e.detail.token.name}" has been successfully removed`, CommonToastType.Success);
    } catch (e) {
      GlobalCommonToast.show('An error occurred during token removal', CommonToastType.Error, e);
      log.error(e);
    }
  }

  async function moveToken(e: CustomEvent<{ from: number; to: number }>) {
    const { from, to } = e.detail;
    if (totpList && from != to) {
      try {
        await SharedTotpAppClient.moveToken(totpList[from].id, totpList[to].id, abortController.signal);
      } catch (e) {
        GlobalCommonToast.show('An error occurred during token movement', CommonToastType.Error, e);
        log.error(e);
      }
      await updateTokenList();
    }
  }

  onDestroy(() => abortController.abort());
  onMount(() => updateTokenList());
</script>

{#if totpList}
  <TotpList list={totpList} on:delete={onListItemDelete} on:move={moveToken} />
{/if}
