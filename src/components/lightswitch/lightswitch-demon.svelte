<script lang="ts">
  import { GlobalAppSettings } from '$stores/global-app-settings';
  import { autoModeWatcher, setInitialClassState } from './lightswitch';

  autoModeWatcher();
</script>

<svelte:head>
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})('${
    GlobalAppSettings.theme.colorScheme
  }');</script>`}
</svelte:head>
