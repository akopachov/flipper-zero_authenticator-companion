<script>
  import List, { Item, PrimaryText, SecondaryText, Text } from "@smui/list";

  export let totpAppClient;

  let totpList = null;

  async function main() {
    await totpAppClient.waitForApp();
    totpList = await totpAppClient.listTokens();
    console.log(totpList);
  }

  main();
</script>

{#if totpList}
  <List
    twoLine
    avatarList
  >
    {#each totpList as item}
      <Item>
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
