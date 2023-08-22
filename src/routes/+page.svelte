<script lang="ts">
  import { SharedTotpAppClient } from '../stores/totp-shared-client';
  import { findIcon } from '$lib/totp-icons';
  import List, { Graphic, Item, Meta, PrimaryText, SecondaryText, Text, Separator } from '@smui/list';
  import Menu from '@smui/menu';
  import IconButton from '@smui/icon-button';
  import { onDestroy, onMount } from 'svelte';
  import delay from 'delay';
  import type { TokenInfoBase } from '../models/token-info';
  import { GlobalCommonDialog } from '../stores/global-common-dialog';
  import { CommonSnackbarType, GlobalCommonSnackbar } from '../stores/global-common-snackbar';
  import { goto } from '$app/navigation';

  let abortController = new AbortController();
  let totpList: TokenInfoBase[] | null = null;
  let totpListItemMenu: Menu;
  let totpListItemMenuAnchorEl: Element;
  let totpListCurrentItem: TokenInfoBase | null = null;

  async function updateTokenList() {
    try {
      //await $SharedTotpAppClient.syncTime(abortController.signal);
      totpList = await $SharedTotpAppClient.listTokens(abortController.signal);
    } catch (e) {
      GlobalCommonSnackbar.show('An error occurred during querying token list', CommonSnackbarType.Error);
      console.error(e);
    }
  }

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `./totp-icons/${iconFileName}`;
  }

  async function onTotpListItemMenuClicked(event: CustomEvent, currentItem: TokenInfoBase) {
    totpListItemMenu.setOpen(false);
    await delay(90);
    totpListCurrentItem = currentItem;
    totpListItemMenuAnchorEl = event.target as Element;
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
          await $SharedTotpAppClient.removeToken(totpListCurrentItem.id, abortController.signal);
          await updateTokenList();
          GlobalCommonSnackbar.show(
            `Token ${totpListCurrentItem.name} has been successfully removed`,
            CommonSnackbarType.Success,
          );
        } catch (e) {
          GlobalCommonSnackbar.show('An error occurred during token removal', CommonSnackbarType.Error);
          console.error(e);
        }
      }
    }
  }

  async function onListItemUpdateClick() {
    if (totpListCurrentItem) {
      await goto(`/update/${totpListCurrentItem.id}`);
    }
  }

  onDestroy(() => abortController.abort());
  onMount(() => updateTokenList());
</script>

{#if totpList}
  <List twoLine avatarList nonInteractive>
    {#each totpList as item}
      <Item>
        <Graphic>
          <img src={getIcon(item.name)} alt="icon" />
        </Graphic>
        <Text>
          <PrimaryText>{item.name}</PrimaryText>
          <SecondaryText>{item.hashingAlgo}</SecondaryText>
        </Text>
        <Meta>
          <IconButton class="material-icons" on:click={e => onTotpListItemMenuClicked(e, item)}>more_vert</IconButton>
        </Meta>
      </Item>
    {/each}
  </List>
{/if}

<Menu
  bind:this={totpListItemMenu}
  anchor={true}
  bind:anchorElement={totpListItemMenuAnchorEl}
  fixed={true}
  anchorCorner="BOTTOM_LEFT">
  <List>
    <Item on:click={onListItemUpdateClick}>
      <Graphic class="material-icons">edit</Graphic>
      <Text>Edit</Text>
    </Item>
    <Separator />
    <Item on:click={onListItemDeleteClick}>
      <Graphic class="material-icons">delete</Graphic>
      <Text>Delete</Text>
    </Item>
  </List>
</Menu>

<style>
</style>
