<script lang="ts">
  import { SharedTotpAppClient } from '$lib/totp-client';
  import { findIcon } from '$lib/totp-icons';
  import List, {
    Graphic,
    Item,
    Meta,
    PrimaryText,
    SecondaryText,
    Text,
    Separator,
  } from '@smui/list';
  import Menu from '@smui/menu';
  import IconButton from '@smui/icon-button';
  import { onDestroy } from 'svelte';
  import delay from 'delay';

  let abortController = new AbortController();
  let totpList: any[] | null = null;
  let totpListItemMenu: Menu;
  let totpListItemMenuAnchorEl: Element;

  async function main() {
    totpList = await SharedTotpAppClient.listTokens(abortController.signal);
    console.log(totpList);
  }

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `./totp-icons/${iconFileName}`;
  }

  async function onTotpListItemMenuClicked(event: UIEvent) {
    totpListItemMenu.setOpen(false);
    await delay(90);
    totpListItemMenuAnchorEl = event.target as Element;
    totpListItemMenu.setOpen(true);
  }

  onDestroy(() => abortController.abort());

  main();
</script>

{#if totpList}
  <List twoLine avatarList nonInteractive>
    {#each totpList as item}
      <Item>
        <Graphic>
          <img src={getIcon(item.Name)} alt="icon" />
        </Graphic>
        <Text>
          <PrimaryText>{item.Name}</PrimaryText>
          <SecondaryText>{item.Name}</SecondaryText>
        </Text>
        <Meta>
          <IconButton class="material-icons" on:click={onTotpListItemMenuClicked}>
            more_vert
          </IconButton>
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
  anchorCorner="BOTTOM_LEFT"
>
  <List>
    <Item>
      <Graphic class="material-icons">edit</Graphic>
      <Text>Edit</Text>
    </Item>
    <Separator />
    <Item>
      <Graphic class="material-icons">delete</Graphic>
      <Text>Delete</Text>
    </Item>
  </List>
</Menu>

<style>
</style>
