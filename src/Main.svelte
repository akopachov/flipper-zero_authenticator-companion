<script>
  import { Router, navigate, Route } from "svelte-routing";
  import { TotpAppClient } from './helpers/totp-client';
  import TokenList from './TokenList.svelte';
  import Button from '@smui/button';

  export let url = "/";
  let totpAppClient = null;

  function closeTotpAppClient () {
    totpAppClient.close();
  }

  async function main() {
    totpAppClient = new TotpAppClient();
    await totpAppClient.waitForDevice();
    navigate('/list');
  }

  main();

</script>

<svelte:window on:beforeunload={closeTotpAppClient}/>

<main>
  <Router {url}>
    <Route path="/">
      <Button>Test</Button>
      <h1>Waiting for flipper...</h1>
    </Route>
    <Route path="/list">
      <TokenList {totpAppClient}></TokenList>
    </Route>
  </Router>
</main>

<style lang="scss">
  @import '~svelte-material-ui/themes/material.css';
</style>
