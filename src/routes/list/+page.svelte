<script lang="ts">
  import { SharedTotpAppClient } from '$lib/totp-client';
  import { findIcon } from '$lib/totp-icons';
  import List, { Graphic, Item, PrimaryText, SecondaryText, Text } from '@smui/list';

  let totpList: any[] | null = null;
  async function main() {
    await SharedTotpAppClient.waitForApp();
    totpList = await SharedTotpAppClient.listTokens();
    console.log(totpList);
  }

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `./totp-icons/${iconFileName}`;
  }

  main();
</script>

{#if totpList}
  <List twoLine avatarList>
    {#each totpList as item}
      <Item>
        <Graphic>
          <img src={getIcon(item.Name)} alt="icon" />
        </Graphic>
        <Text>
          <PrimaryText>{item.Name}</PrimaryText>
          <SecondaryText>{item.Name}</SecondaryText>
        </Text>
      </Item>
    {/each}
  </List>
{/if}

<style>
</style>
