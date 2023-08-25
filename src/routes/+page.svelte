<script lang="ts">
  import log from 'electron-log';
  import { SharedTotpAppClient } from '../stores/totp-shared-client';
  import List, { Graphic, Item, Text, Separator } from '@smui/list';
  import Menu from '@smui/menu';
  import { onDestroy, onMount } from 'svelte';
  import delay from 'delay';
  import type { TokenInfoBase } from '$models/token-info';
  import { GlobalCommonDialog } from '$stores/global-common-dialog';
  import { CommonSnackbarType, GlobalCommonSnackbar } from '$stores/global-common-snackbar';
  import TotpList from '$components/totp-list/totp-list.svelte';

  let abortController = new AbortController();
  let totpList: TokenInfoBase[] | null = null;
  let totpListItemMenu: Menu;
  let totpListItemMenuAnchorEl: Element;
  let totpListCurrentItem: TokenInfoBase | null = null;

  async function updateTokenList() {
    try {
      totpList = await SharedTotpAppClient.listTokens(abortController.signal);
    } catch (e) {
      GlobalCommonSnackbar.show('An error occurred during querying token list', CommonSnackbarType.Error);
      log.error(e);
    }
  }

  async function onTotpListItemMenuClicked(e: CustomEvent<{ element: Element; token: TokenInfoBase }>) {
    const { token, element } = e.detail;
    totpListItemMenu.setOpen(false);
    await delay(90);
    totpListCurrentItem = token;
    totpListItemMenuAnchorEl = element;
    totpListItemMenu.setOpen(true);
  }

  async function onListItemDeleteClick() {
    if (totpListCurrentItem) {
      const confirmDeleteActionResult = 'yes';
      const actionResult = await GlobalCommonDialog.show(
        'Confirmation',
        `Do you really want to delete token "${totpListCurrentItem.name}"?`,
        [
          { text: 'Yes', action: confirmDeleteActionResult },
          { text: 'No', action: 'no' },
        ],
      );
      if (actionResult == confirmDeleteActionResult) {
        try {
          await SharedTotpAppClient.removeToken(totpListCurrentItem.id, abortController.signal);
          await updateTokenList();
          GlobalCommonSnackbar.show(
            `Token ${totpListCurrentItem.name} has been successfully removed`,
            CommonSnackbarType.Success,
          );
        } catch (e) {
          GlobalCommonSnackbar.show('An error occurred during token removal', CommonSnackbarType.Error);
          log.error(e);
        }
      }
    }
  }

  async function moveToken(e: CustomEvent<{ from: number; to: number }>) {
    const { from, to } = e.detail;
    if (totpList && from != to) {
      try {
        await SharedTotpAppClient.moveToken(totpList[from].id, totpList[to].id, abortController.signal);
      } catch (e) {
        GlobalCommonSnackbar.show('An error occurred during token movement', CommonSnackbarType.Error);
        log.error(e);
      }
      await updateTokenList();
    }
  }

  onDestroy(() => abortController.abort());
  onMount(() => updateTokenList());
</script>

{#if totpList}
  <TotpList list={totpList} on:tokenmenu={e => onTotpListItemMenuClicked(e)} on:move={e => moveToken(e)} />
{/if}

<Menu
  bind:this={totpListItemMenu}
  bind:anchorElement={totpListItemMenuAnchorEl}
  fixed={true}
  anchorCorner="BOTTOM_LEFT">
  {#if totpListCurrentItem}
    <List>
      <Item tag="a" href="/update/{totpListCurrentItem.id}">
        <Graphic class="material-icons">edit</Graphic>
        <Text>Edit</Text>
      </Item>
      <Separator />
      <Item on:click={onListItemDeleteClick}>
        <Graphic class="material-icons">delete</Graphic>
        <Text>Delete</Text>
      </Item>
    </List>
  {/if}
</Menu>
