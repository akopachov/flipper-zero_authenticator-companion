<script lang="ts">
  import { getAppSettings } from '$stores/app-settings';
  import { autoModeWatcher, setInitialClassState } from './lightswitch';

  autoModeWatcher();
</script>

<svelte:head>
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})('${
    getAppSettings().theme.colorScheme
  }');</script>`}
</svelte:head>
