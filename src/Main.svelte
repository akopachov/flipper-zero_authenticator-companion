<script>
  import { Router, navigate, Route } from "svelte-routing";
  import { ipcRenderer } from 'electron';
  import { TotpAppClient } from './helpers/totp-client';
  import Desktop from './Desktop.svelte';
  import "@fontsource/material-icons";
  import "@fontsource/roboto";
  import 'smelte/src/tailwind.css';
  import Button from "smelte/src/components/Button";

  export let url = "/";
  let totpAppClient = null;

  function closeTotpAppClient () {
    if (totpAppClient != null) {
      totpAppClient.close();
    }
  }

  async function main() {
    totpAppClient = await TotpAppClient.createForFirstFoundDevice();
    totpAppClient.on('close', e => {
      if (e && e.disconnected) {
        ipcRenderer.send('totpca:force-reload', {});
      }
    });
    navigate('/desktop');
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
    <Route path="/desktop">
      <Desktop {totpAppClient}></Desktop>
    </Route>
  </Router>
</main>

<style>

</style>
